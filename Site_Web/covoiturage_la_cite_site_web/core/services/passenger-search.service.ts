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

export interface PassengerSearchRequest {
  passengerId: string;
  departureCoords?: [number, number];
  arrivalCoords?: [number, number];
  desiredHour?: number;
  /** Heure d'arrivée souhaitée (heures décimales) — déclasse sans éliminer */
  desiredArrivalHour?: number;
  desiredWeekday?: number;
  sortKey?: PassengerSortKey;
  maxPrice?: number;
  minSeatsAvailable?: number;
  departureRadiusMeters?: number;
  arrivalRadiusMeters?: number;
}

export interface PassengerSearchResponse {
  trips: TripSearchDTO[];
  blockedTrips: TripSearchDTO[];
  total: number;
  matched: number;
  eliminated: number;
}

export function loadPassengerSearchContext(passengerId: string) {
  const passenger = persistenceManager.readById<UserModel>('users', passengerId);
  if (!passenger) return null;

  const passengerPrefs = passenger.preferencesId
    ? persistenceManager.readById<UserPreferencesModel>('user_preferences', passenger.preferencesId)
    : null;

  const allTrips = persistenceManager.readAll<TripModel>('trips').filter(
    (trip) => ['published', 'full'].includes(trip.status),
  );

  const allUsers = persistenceManager.readAll<UserModel>('users');
  const driversMap = new Map<string, UserModel>(allUsers.map((user) => [user.id, user]));

  const affinites = persistenceManager.readAll<AffiniteRecord>('affinites').filter(
    (item) =>
      item.idPersonneQuiAMisEnFavoris === passengerId ||
      item.idPersonneEnFavoris === passengerId,
  );

  return {
    passenger,
    passengerPrefs,
    allTrips,
    driversMap,
    affinites,
  };
}

export function executePassengerSearch(body: PassengerSearchRequest): PassengerSearchResponse | null {
  const context = loadPassengerSearchContext(body.passengerId);
  if (!context) return null;

  const { trips: matchedTrips, scores, eliminated } = runPassengerMatchingV4({
    trips: context.allTrips,
    passenger: context.passenger,
    passengerPrefs: context.passengerPrefs ?? null,
    drivers: context.driversMap,
    affinites: context.affinites,
    departureCoords: body.departureCoords ?? null,
    arrivalCoords: body.arrivalCoords ?? null,
    desiredHour: body.desiredHour,
    desiredArrivalHour: body.desiredArrivalHour,
    desiredWeekday: body.desiredWeekday,
    sortKey: body.sortKey ?? 'matching_desc',
    maxPrice: body.maxPrice,
    minSeatsAvailable: body.minSeatsAvailable,
    departureRadiusMeters: body.departureRadiusMeters,
    arrivalRadiusMeters: body.arrivalRadiusMeters,
  });

  const trips = matchedTrips.map((trip) =>
    toTripSearchDTO(trip, context.driversMap.get(trip.driverId), scores[trip.id]),
  );

  const blockedTrips = Object.entries(eliminated)
    .map(([tripId, reason]) => {
      const trip = context.allTrips.find((item) => item.id === tripId);
      if (!trip) return null;

      return toTripSearchDTO(
        trip,
        context.driversMap.get(trip.driverId),
        scores[trip.id] ?? {
          total: 0,
          geoDepart: 0,
          geoArrivee: 0,
          compatMusique: 0,
          compatConversation: 0,
          compatBagages: 0,
          compatLangue: 0,
          fiabiliteNote: 0,
          fiabiliteAnnulation: 0,
          fiabilitePonctualite: 0,
          fiabiliteVerifie: 0,
          affiniteFavoris: 0,
          affiniteNote: 0,
          affiniteTrajets: 0,
          affinitePassagersBord: 0,
          horaire: 0,
          bonusRecurrence: 0,
          eliminated: reason,
        },
        reason,
      );
    })
    .filter((trip): trip is TripSearchDTO => trip !== null);

  return {
    trips,
    blockedTrips,
    total: context.allTrips.length,
    matched: trips.length,
    eliminated: Object.keys(eliminated).length,
  };
}
