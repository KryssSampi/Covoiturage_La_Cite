/**
 * POST /api/admin/simulate/autoplay
 * Initialise la simulation GPS d'un trajet côté serveur :
 *   - Pose simControlActive=true sur le trajet (bloque le GPS réel du conducteur)
 *   - Pose alreadyOnTheirWay=true (requis pour déclencher theyReallyEnd)
 *   - Retourne driverId, polyline, departure, arrival au client admin
 *     qui enverra ensuite les positions progressivement via PATCH /api/locations
 *
 * DELETE /api/admin/simulate/autoplay
 * Stoppe la simulation GPS (retire le flag simControlActive).
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { tripId: string };
    if (!body.tripId) {
      return NextResponse.json({ error: 'tripId requis' }, { status: 400 });
    }

    const trip = persistenceManager.readById<Record<string, unknown>>('trips', body.tripId);
    if (!trip) {
      return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Active le contrôle admin + marque le départ réel
    persistenceManager.updateItem<Record<string, unknown>>('trips', body.tripId, {
      simControlActive: true,
      alreadyOnTheirWay: true,
      status: 'in_progress',
      updatedAt: now,
    });

    return NextResponse.json({
      ok: true,
      driverId: trip.driverId,
      polyline: (trip.polyline as [number, number][]) ?? [],
      departure: trip.departure,
      arrival: trip.arrival,
    });
  } catch (err) {
    console.error('[api/admin/simulate/autoplay]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get('tripId');
    if (!tripId) {
      return NextResponse.json({ error: 'tripId requis' }, { status: 400 });
    }

    persistenceManager.updateItem<Record<string, unknown>>('trips', tripId, {
      simControlActive: false,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/simulate/autoplay]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
