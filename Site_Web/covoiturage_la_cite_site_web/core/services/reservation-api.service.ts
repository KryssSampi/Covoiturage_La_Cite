import { persistenceManager } from '@/tests/PersistenceManager';
import type { TripModel } from '@/core/models/TripModel';
import type { IndisponibilityModel } from '@/core/models/IndisponibilityModel';
import { isTripBlockedByIndisponibility } from '@/core/utils/indisponibility.utils';

export type ReservationRecord = Record<string, unknown>;

export interface ReservationQueryFilters {
  passengerId?: string | null;
  driverId?: string | null;
  status?: string | null;
}

export interface ReservationCreationResult {
  reservation?: ReservationRecord;
  error?: string;
  status?: number;
}

export function filterReservationsForQuery(filters: ReservationQueryFilters): ReservationRecord[] {
  let reservations = persistenceManager.readAll<ReservationRecord>('reservations');
  if (filters.passengerId) reservations = reservations.filter((item) => item.passengerId === filters.passengerId);
  if (filters.driverId) reservations = reservations.filter((item) => item.driverId === filters.driverId);
  if (filters.status) reservations = reservations.filter((item) => item.status === filters.status);
  return reservations;
}

export function buildPendingReservationRecord(body: ReservationRecord): ReservationCreationResult {
  if (!body.tripId || !body.passengerId) {
    return { error: 'tripId et passengerId sont requis', status: 400 };
  }

  const passengerId = body.passengerId as string;
  const existingPending = persistenceManager.readAll<ReservationRecord>('reservations')
    .filter((item) => item.passengerId === passengerId && item.status === 'pending');
  if (existingPending.length >= 5) {
    return {
      error: "Maximum 5 demandes simultanées — annulez une demande avant d'en créer une nouvelle",
      status: 429,
    };
  }

  const trip = persistenceManager.readById<TripModel>('trips', body.tripId as string);
  if (!trip) {
    return { error: 'Trajet introuvable', status: 404 };
  }
  if (trip.currentPassengers >= trip.maxPassengers) {
    return { error: 'Plus de places disponibles', status: 409 };
  }

  const passengerIndisponibility = persistenceManager.readById<IndisponibilityModel>('indisponibilities', passengerId);
  if (isTripBlockedByIndisponibility(trip, passengerIndisponibility)) {
    return { error: 'Le passager est indisponible sur cette plage', status: 409 };
  }

  const driverId = String(trip.driverId);
  const driverIndisponibility = persistenceManager.readById<IndisponibilityModel>('indisponibilities', driverId);
  if (isTripBlockedByIndisponibility(trip, driverIndisponibility)) {
    return { error: 'Le conducteur est indisponible sur cette plage', status: 409 };
  }

  const year = new Date().getFullYear();
  const rand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
  const now = new Date().toISOString();

  return {
    reservation: {
      ...body,
      id: `RSV-${year}-${rand}`,
      status: 'pending',
      driverId,
      createdAt: now,
      updatedAt: now,
    },
  };
}
