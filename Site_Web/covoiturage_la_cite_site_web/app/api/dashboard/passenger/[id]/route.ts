/**
 * GET /api/dashboard/passenger/[id]
 * Route thin — délègue toute la logique à buildPassengerDashboard.
 */
import { NextResponse } from 'next/server';
import { buildPassengerDashboard } from '@/core/services/dashboard-passenger.service';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: passengerId } = await params;

    const result = buildPassengerDashboard(passengerId);
    if (!result) {
      return NextResponse.json({ error: 'Passager introuvable' }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[dashboard/passenger]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
