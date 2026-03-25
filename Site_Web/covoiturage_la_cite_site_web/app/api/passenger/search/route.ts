/**
 * POST /api/passenger/search
 *
 * Recherche de trajets avec matching v4 côté serveur.
 * Les données sensibles (driverId brut, passengerIds, etc.) ne sont jamais
 * exposées au client — seul le DTO TripSearchDTO est retourné.
 *
 * Body attendu :
 * {
 *   passengerId:            string
 *   departureCoords?:       [lat, lng]
 *   arrivalCoords?:         [lat, lng]
 *   desiredHour?:           number        (0–23.99)
 *   desiredWeekday?:        number        (0=dim … 6=sam)
 *   sortKey?:               PassengerSortKey
 *   maxPrice?:              number
 *   minSeatsAvailable?:     number
 *   departureRadiusMeters?: number
 *   arrivalRadiusMeters?:   number
 * }
 */

import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';
import type { TripModel } from '@/core/models/TripModel';
import type { UserModel } from '@/core/models/UserModel';
import type { UserPreferencesModel } from '@/core/models/UserPreferencesModel';
import type { AffiniteRecord } from '@/core/models/AffiniteModel';
import type { PassengerSortKey } from '@/features/search/types/search.feature.types';
import {
  runPassengerMatchingV4,
  toTripSearchDTO,
  type TripSearchDTO,
} from '@/features/search/utils/matchingV4';

interface SearchBody {
  passengerId: string;
  departureCoords?: [number, number];
  arrivalCoords?: [number, number];
  desiredHour?: number;
  desiredWeekday?: number;
  sortKey?: PassengerSortKey;
  maxPrice?: number;
  minSeatsAvailable?: number;
  departureRadiusMeters?: number;
  arrivalRadiusMeters?: number;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SearchBody;

    if (!body.passengerId) {
      return NextResponse.json({ error: 'passengerId est requis' }, { status: 400 });
    }

    // ── Chargement des données depuis la DB test ──────────────────────────────

    const passenger = persistenceManager.readById<UserModel>('users', body.passengerId);
    if (!passenger) {
      return NextResponse.json({ error: 'Passager introuvable' }, { status: 404 });
    }

    // Préférences étendues du passager (null → DEFAULT_USER_PREFERENCES_EXTENDED)
    const passengerPrefs = passenger.preferencesId
      ? persistenceManager.readById<UserPreferencesModel>('user_preferences', passenger.preferencesId)
      : null;

    // Tous les trajets publiés
    const allTrips = persistenceManager.readAll<TripModel>('trips').filter(
      (t) => t.status === 'published'
    );

    // Map conducteurs
    const allUsers = persistenceManager.readAll<UserModel>('users');
    const driversMap = new Map<string, UserModel>(
      allUsers.map((u) => [u.id, u])
    );

    // Affinités du passager (format legacy compatible AffiniteRecord)
    const rawAffinites = persistenceManager.readAll<AffiniteRecord>('affinites').filter(
      (a) =>
        a.idPersonneQuiAMisEnFavoris === body.passengerId ||
        a.idPersonneEnFavoris === body.passengerId
    );

    // ── Matching v4 côté serveur ──────────────────────────────────────────────

    const { trips: matchedTrips, scores, eliminated } = runPassengerMatchingV4({
      trips:                 allTrips,
      passenger,
      passengerPrefs:        passengerPrefs ?? null,
      drivers:               driversMap,
      affinites:             rawAffinites,
      departureCoords:       body.departureCoords ?? null,
      arrivalCoords:         body.arrivalCoords ?? null,
      desiredHour:           body.desiredHour,
      desiredWeekday:        body.desiredWeekday,
      sortKey:               body.sortKey ?? 'matching_desc',
      maxPrice:              body.maxPrice,
      minSeatsAvailable:     body.minSeatsAvailable,
      departureRadiusMeters: body.departureRadiusMeters,
      arrivalRadiusMeters:   body.arrivalRadiusMeters,
    });

    // ── Conversion en DTOs (sans données sensibles) ───────────────────────────

    const dtos: TripSearchDTO[] = matchedTrips.map((trip) =>
      toTripSearchDTO(trip, driversMap.get(trip.driverId), scores[trip.id])
    );

    return NextResponse.json({
      trips:     dtos,
      total:     allTrips.length,
      matched:   dtos.length,
      eliminated: Object.keys(eliminated).length,
    });

  } catch (err) {
    console.error('[/api/passenger/search]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
