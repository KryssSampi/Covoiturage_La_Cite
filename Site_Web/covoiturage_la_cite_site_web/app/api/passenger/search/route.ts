/**
 * POST /api/passenger/search
 * Délègue au Server Core — POST api/matching/search
 *
 * Mapping body client → MatchingSearchDto :
 *   departureCoords: [lat, lng]  →  originLat, originLng
 *   arrivalCoords:   [lat, lng]  →  destinationLat, destinationLng
 *   desiredHour: number (heures décimales)  →  departureTime "HH:mm"
 */
import { NextResponse } from 'next/server';
import { MatchingService, type MatchingSearchDto } from '@/server/services/MatchingService';
import { withAuth } from '@/server/auth';

interface ClientSearchBody {
  passengerId?: string;
  departureCoords?: [number, number];   // [lat, lng]
  arrivalCoords?: [number, number];     // [lat, lng]
  desiredHour?: number;                 // ex: 8.5 = 08h30
  desiredWeekday?: number;
  maxPrice?: number;
  minSeatsAvailable?: number;
  departureRadiusMeters?: number;
  arrivalRadiusMeters?: number;
}

export async function POST(req: Request) {
  try {
    const auth = await withAuth(req);
    const body = await req.json() as ClientSearchBody;

    // ── Mapping coords client → Server Core ────────────────────────────────
    const [originLat, originLng] = body.departureCoords ?? [0, 0];
    const [destinationLat, destinationLng] = body.arrivalCoords ?? [0, 0];

    // desiredHour (décimal) → "HH:mm"
    let departureTime = '08:00';
    if (body.desiredHour != null) {
      const h = Math.floor(body.desiredHour);
      const m = Math.round((body.desiredHour - h) * 60);
      departureTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }

    const dto: MatchingSearchDto = {
      originLat,
      originLng,
      destinationLat,
      destinationLng,
      departureTime,
    };

    const result = await MatchingService.search(dto, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[/api/passenger/search]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
