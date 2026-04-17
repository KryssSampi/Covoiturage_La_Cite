/**
 * GET /api/driver/historique
 * Délègue au Server Core — GET api/driver/historique
 */
import { NextResponse } from 'next/server';
import { HistoriqueService } from '@/server/services/HistoriqueService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await HistoriqueService.getDriverHistorique(undefined, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    const raw = result.data as unknown;
    const entries = Array.isArray(raw) ? raw : ((raw as { items?: unknown[] } | null)?.items ?? []);
    const mapped = (entries as Array<{
      tripId?: string; origin?: string; destination?: string;
      departureTime?: string; status?: string; price?: number; passengers?: number;
    }>).map((e) => ({
      id:              e.tripId ?? '',
      driverId:        '',
      departure:       e.origin ?? '',
      destination:     e.destination ?? '',
      date:            (e.departureTime ?? '').slice(0, 10),
      time:            (e.departureTime ?? '').length >= 16 ? (e.departureTime ?? '').slice(11, 16) : '',
      duration:        null,
      maxPassengers:   e.passengers ?? 0,
      passengers:      [],
      price:           e.price ?? 0,
      pendingRequests: 0,
      status:          (e.status ?? 'completed').toLowerCase().replace('_', '-'),
      isImminent:      false,
    }));
    return NextResponse.json(mapped);
  } catch (err) {
    console.error('[api/driver/historique]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
