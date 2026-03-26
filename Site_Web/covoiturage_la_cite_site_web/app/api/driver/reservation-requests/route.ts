/**
 * GET /api/driver/reservation-requests?driverId=XXX
 * Route thin — délègue à buildDriverReservationRequests.
 */
import { NextResponse } from 'next/server';
import { buildDriverReservationRequests } from '@/core/services/historique.service';

export async function GET(req: Request) {
  try {
    const driverId = new URL(req.url).searchParams.get('driverId');
    if (!driverId) {
      return NextResponse.json({ error: 'Le paramètre driverId est requis' }, { status: 400 });
    }

    return NextResponse.json(buildDriverReservationRequests(driverId));
  } catch (err) {
    console.error('[api/driver/reservation-requests]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
