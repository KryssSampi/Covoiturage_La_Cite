/**
 * GET  /api/trips  — Liste de trajets filtrés
 * POST /api/trips  — Création d'un trajet
 */

import { NextResponse } from 'next/server';
import type { TripModel } from '@/core/models/TripModel';
import { persistenceManager } from '@/tests/PersistenceManager';
import { buildCreatedTripRecord, filterTripsForQuery } from '@/core/services/trip-api.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const trips = filterTripsForQuery({
      driverId: searchParams.get('driverId'),
      passengerId: searchParams.get('passengerId'),
      status: searchParams.get('status'),
      unavailableForUserId: searchParams.get('unavailableForUserId'),
    });

    return NextResponse.json(trips);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const trip = (await req.json()) as TripModel;
    const result = buildCreatedTripRecord(trip);

    if (!result.trip) {
      return NextResponse.json({ error: result.error ?? 'Erreur serveur' }, { status: result.status ?? 500 });
    }

    persistenceManager.addItem('trips', result.trip);
    return NextResponse.json(result.trip, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
