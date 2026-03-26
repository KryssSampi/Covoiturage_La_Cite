/**
 * GET /api/dashboard/driver/[id]
 * Route thin — délègue toute la logique à buildDriverDashboard.
 */
import { NextResponse } from 'next/server';
import { buildDriverDashboard } from '@/core/services/dashboard-driver.service';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: driverId } = await params;

    const result = buildDriverDashboard(driverId);
    if (!result) {
      return NextResponse.json({ error: 'Conducteur introuvable' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[dashboard/driver]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
