/**
 * GET  /api/trips               — Liste de trajets (filtrés par query params)
 * POST /api/trips               — Création d'un trajet
 */
import { NextResponse } from 'next/server';
import type { TripModel } from '@/core/models/TripModel';
import type { IndisponibilityModel } from '@/core/models/IndisponibilityModel';
import { isTripBlockedByIndisponibility } from '@/core/utils/indisponibility.utils';
import { persistenceManager } from '@/tests/PersistenceManager';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId    = searchParams.get('driverId');
    const passengerId = searchParams.get('passengerId');
    const status      = searchParams.get('status');
    const unavailableForUserId = searchParams.get('unavailableForUserId');

    let trips = persistenceManager.readAll<TripModel>('trips');

    if (driverId)    trips = trips.filter((t) => t.driverId === driverId);
    if (passengerId) trips = trips.filter((t) => (t.passengerIds as string[])?.includes(passengerId));
    if (status)      trips = trips.filter((t) => t.status === status);
    if (unavailableForUserId) {
      const indisponibility = persistenceManager.readById<IndisponibilityModel>('indisponibilities', unavailableForUserId);
      trips = trips.filter((trip) => !isTripBlockedByIndisponibility(trip, indisponibility));
    }

    return NextResponse.json(trips);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const trip = (await req.json()) as TripModel;

    if (!trip.driverId || !trip.departureDate) {
      return NextResponse.json(
        { error: 'driverId et departureDate sont requis' },
        { status: 400 }
      );
    }

    const driverIndisponibility = persistenceManager.readById<IndisponibilityModel>('indisponibilities', trip.driverId);
    if (isTripBlockedByIndisponibility(trip, driverIndisponibility)) {
      return NextResponse.json(
        { error: "Le conducteur est indisponible sur cette plage" },
        { status: 409 },
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
