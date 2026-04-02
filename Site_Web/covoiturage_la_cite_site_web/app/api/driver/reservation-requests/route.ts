/**
 * GET /api/driver/reservation-requests
 * Délègue au Server Core — GET api/reservations/driver-requests
 */
import { NextResponse } from 'next/server';
import { ReservationService } from '@/server/services/ReservationService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await ReservationService.getDriverRequests(auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/driver/reservation-requests]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
