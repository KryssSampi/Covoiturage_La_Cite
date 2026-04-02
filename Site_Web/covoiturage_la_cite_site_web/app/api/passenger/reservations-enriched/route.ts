/**
 * GET /api/passenger/reservations-enriched
 * Délègue au Server Core — GET api/reservations/passenger-enriched
 */
import { NextResponse } from 'next/server';
import { ReservationService } from '@/server/services/ReservationService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await ReservationService.getPassengerEnriched(undefined, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/passenger/reservations-enriched]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
