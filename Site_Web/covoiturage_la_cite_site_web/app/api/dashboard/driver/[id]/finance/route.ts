/**
 * GET /api/dashboard/driver/[id]/finance
 * Délègue au Server Core — GET api/finances/driver/summary
 */
import { NextResponse } from 'next/server';
import { FinanceService } from '@/server/services/FinanceService';
import { withAuth } from '@/server/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const auth = await withAuth(req);

    const result = await FinanceService.getDriverSummary(auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 404 });
    }

    const data = result.data;
    return NextResponse.json({
      soldeDisponible:     data?.availableBalance ?? 0,
      currency:            'CAD',
      weeklyProfit:        data?.totalEarnings ?? 0,
      weeklyPendingProfit: data?.pendingBalance ?? 0,
      penalties:           data?.activePenalties ?? 0,
    });
  } catch (err) {
    console.error('[GET /api/dashboard/driver/finance]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
