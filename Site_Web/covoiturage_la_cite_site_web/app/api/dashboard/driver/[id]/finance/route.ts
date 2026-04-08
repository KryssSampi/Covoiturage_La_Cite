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
      // Pas de profil conducteur encore → retourner des 0 plutôt qu'un 404
      return NextResponse.json({
        soldeDisponible: 0, currency: 'CAD', weeklyProfit: 0, weeklyPendingProfit: 0, penalties: 0,
      });
    }

    const data = result.data;
    return NextResponse.json({
      soldeDisponible:     data?.soldeDisponible  ?? 0,
      currency:            data?.currency         ?? 'CAD',
      weeklyProfit:        data?.gainSemaine      ?? 0,
      weeklyPendingProfit: data?.soldeEnTransit   ?? 0,
      penalties:           data?.soldePenalites   ?? 0,
    });
  } catch (err) {
    console.error('[GET /api/dashboard/driver/finance]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
