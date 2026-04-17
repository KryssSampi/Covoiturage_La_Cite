/**
 * GET /api/passenger/historique
 * Délègue au Server Core — GET api/passenger/historique
 */
import { NextResponse } from 'next/server';
import { HistoriqueService } from '@/server/services/HistoriqueService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await HistoriqueService.getPassengerHistorique(undefined, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    // Server Core may return a paginated wrapper { items, totalCount } — normalize to array
    const raw = result.data as unknown;
    const entries = Array.isArray(raw) ? raw : ((raw as { items?: unknown[] } | null)?.items ?? []);
    const mapped = (entries as Array<{
      tripId?: string; origin?: string; destination?: string;
      departureTime?: string; status?: string; price?: number;
      rating?: number; driverName?: string;
    }>).map((e) => ({
      id:           e.tripId ?? '',
      departure:    e.origin ?? '',
      destination:  e.destination ?? '',
      date:         (e.departureTime ?? '').slice(0, 10),
      time:         (e.departureTime ?? '').length >= 16 ? (e.departureTime ?? '').slice(11, 16) : '',
      price:        e.price ?? 0,
      maxPassengers:0,
      passengers:   [],
      driver: {
        id:         '',
        name:       e.driverName ?? '',
        pictureUrl: '',
        rating:     e.rating ?? 0,
        tripsCount: 0,
      },
      doneDate: (e.status ?? '').toLowerCase() === 'completed' ? (e.departureTime ?? null) : null,
      isImminent: false,
    }));
    return NextResponse.json(mapped);

  } catch (err) {
    console.error('[api/passenger/historique]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
