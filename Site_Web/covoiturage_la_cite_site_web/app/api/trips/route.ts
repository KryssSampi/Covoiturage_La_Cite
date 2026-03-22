/**
 * GET  /api/trips               — Liste de trajets (filtrés par query params)
 * POST /api/trips               — Création d'un trajet
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId    = searchParams.get('driverId');
    const passengerId = searchParams.get('passengerId');
    const status      = searchParams.get('status');

    let trips = persistenceManager.readAll<Record<string, unknown>>('trips');

    if (driverId)    trips = trips.filter((t) => t.driverId === driverId);
    if (passengerId) trips = trips.filter((t) => (t.passengerIds as string[])?.includes(passengerId));
    if (status)      trips = trips.filter((t) => t.status === status);

    return NextResponse.json(trips);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const trip = (await req.json()) as Record<string, unknown>;

    if (!trip.driverId || !trip.departureDate) {
      return NextResponse.json(
        { error: 'driverId et departureDate sont requis' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const newTrip = {
      ...trip,
      createdAt: now,
      updatedAt: now,
    };

    persistenceManager.addItem('trips', newTrip);
    return NextResponse.json(newTrip, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
