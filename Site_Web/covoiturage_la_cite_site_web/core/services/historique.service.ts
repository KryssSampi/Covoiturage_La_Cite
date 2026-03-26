import { persistenceManager } from '@/tests/PersistenceManager';
import type { TripModel }        from '@/core/models/TripModel';
import type { ReservationModel } from '@/core/models/ReservationModel';
import type { UserModel }        from '@/core/models/UserModel';
import {
  tripModelToPublishedTrip,
  tripModelToTrip,
  reservationModelToRequest,
} from '@/features/dashboard/converters/dashboard.converter';

// ─── Driver historique ────────────────────────────────────────────────────────

export function buildDriverHistorique(driverId: string) {
  const allTrips        = persistenceManager.readAll<TripModel>('trips');
  const allReservations = persistenceManager.readAll<ReservationModel>('reservations');
  const allUsers        = persistenceManager.readAll<UserModel>('users');

  const usersMap = new Map(allUsers.map((u) => [u.id, u]));

  return allTrips
    .filter((t) => t.driverId === driverId)
    .map((trip) => {
      const tripReservations = allReservations.filter((r) => r.tripId === trip.id);
      const passengers = tripReservations
        .filter((r) => r.status === 'confirmed' || r.status === 'completed')
        .flatMap((r) => {
          const u = usersMap.get(r.passengerId);
          return u ? [u] : [];
        });
      const pendingCount = tripReservations.filter((r) => r.status === 'pending').length;
      return tripModelToPublishedTrip(trip, passengers, pendingCount);
    });
}

// ─── Passenger historique ─────────────────────────────────────────────────────

export function buildPassengerHistorique(passengerId: string) {
  const allReservations = persistenceManager.readAll<ReservationModel>('reservations');
  const allTrips        = persistenceManager.readAll<TripModel>('trips');
  const allUsers        = persistenceManager.readAll<UserModel>('users');

  const tripsMap = new Map(allTrips.map((t) => [t.id, t]));
  const usersMap = new Map(allUsers.map((u) => [u.id, u]));

  return allReservations
    .filter((r) => r.passengerId === passengerId)
    .flatMap((r) => {
      const trip   = tripsMap.get(r.tripId);
      const driver = trip ? usersMap.get(trip.driverId) : undefined;
      if (!trip || !driver) return [];
      const passengers = trip.passengerIds
        .flatMap((pid) => { const u = usersMap.get(pid); return u ? [u] : []; });
      return [tripModelToTrip(trip, driver, passengers)];
    });
}

// ─── Driver reservation-requests ─────────────────────────────────────────────

export function buildDriverReservationRequests(driverId: string) {
  const allReservations = persistenceManager.readAll<ReservationModel>('reservations');
  const allTrips        = persistenceManager.readAll<TripModel>('trips');
  const allUsers        = persistenceManager.readAll<UserModel>('users');

  const tripsMap = new Map(allTrips.map((t) => [t.id, t]));
  const usersMap = new Map(allUsers.map((u) => [u.id, u]));

  return allReservations
    .filter((r) => r.driverId === driverId && r.status === 'pending')
    .flatMap((r) => {
      const trip      = tripsMap.get(r.tripId);
      const passenger = usersMap.get(r.passengerId);
      if (!trip || !passenger) return [];
      return [reservationModelToRequest(r, trip, passenger)];
    });
}
