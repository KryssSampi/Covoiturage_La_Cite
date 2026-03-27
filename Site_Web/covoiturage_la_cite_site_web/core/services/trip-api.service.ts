import { persistenceManager } from '@/tests/PersistenceManager';
import type { TripModel } from '@/core/models/TripModel';
import type { IndisponibilityModel } from '@/core/models/IndisponibilityModel';
import { isTripBlockedByIndisponibility } from '@/core/utils/indisponibility.utils';

export interface TripQueryFilters {
  driverId?: string | null;
  passengerId?: string | null;
  status?: string | null;
  unavailableForUserId?: string | null;
}

export function filterTripsForQuery(filters: TripQueryFilters): TripModel[] {
  let trips = persistenceManager.readAll<TripModel>('trips');

  if (filters.driverId) {
    trips = trips.filter((trip) => trip.driverId === filters.driverId);
  }
  if (filters.passengerId) {
    trips = trips.filter((trip) => trip.passengerIds?.includes(filters.passengerId as string));
  }
  if (filters.status) {
    trips = trips.filter((trip) => trip.status === filters.status);
  }
  if (filters.unavailableForUserId) {
    const indisponibility = persistenceManager.readById<IndisponibilityModel>('indisponibilities', filters.unavailableForUserId);
    trips = trips.filter((trip) => !isTripBlockedByIndisponibility(trip, indisponibility));
  }

  return trips;
}

export function buildCreatedTripRecord(trip: TripModel): { trip?: TripModel; error?: string; status?: number } {
  if (!trip.driverId || !trip.departureDate) {
    return { error: 'driverId et departureDate sont requis', status: 400 };
  }

  const driverIndisponibility = persistenceManager.readById<IndisponibilityModel>('indisponibilities', trip.driverId);
  if (isTripBlockedByIndisponibility(trip, driverIndisponibility)) {
    return { error: "Le conducteur est indisponible sur cette plage", status: 409 };
  }

  const now = new Date().toISOString();
  const year = new Date().getFullYear();
  const rand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');

  // passengerPrice = pricePerPassenger × 1.15 (frais de service 15 %), arrondi au cent
  const passengerPrice = Math.round(trip.pricePerPassenger * 1.15 * 100) / 100;

  return {
    trip: {
      ...trip,
      id: `TRJ-${year}-${rand}`,
      passengerPrice,
      createdAt: now,
      updatedAt: now,
    },
  };
}
