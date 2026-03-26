import { sortByDateDesc } from '@/core/utils/api-route.utils';
import { persistenceManager } from '@/tests/PersistenceManager';

type UserRecord = Record<string, unknown>;
type TripRecord = Record<string, unknown>;
type ReservationRecord = Record<string, unknown>;

type EnrichedReservation = ReservationRecord & { passengerName: string };
type EnrichedTrip = TripRecord & {
  driverName: string;
  reservations: EnrichedReservation[];
  totalPassengers: number;
};

export function queryAdminUsers(): UserRecord[] {
  const users = persistenceManager.readAll<UserRecord>('users');

  return users.map(({ password, passwordHash, token, ...rest }) => {
    void password;
    void passwordHash;
    void token;
    return rest;
  });
}

export function queryAdminTrips(): EnrichedTrip[] {
  const trips = persistenceManager.readAll<TripRecord>('trips');
  const reservations = persistenceManager.readAll<ReservationRecord>('reservations');
  const users = persistenceManager.readAll<UserRecord>('users');
  const userMap = new Map(users.map((user) => [user.id as string, user]));

  const enrichedTrips: EnrichedTrip[] = trips.map((trip) => {
    const driver = userMap.get(trip.driverId as string);
    const tripReservations: EnrichedReservation[] = reservations
      .filter((reservation) => reservation.tripId === trip.id)
      .map((reservation) => {
        const passenger = userMap.get(reservation.passengerId as string);
        return {
          ...reservation,
          passengerName: passenger
            ? `${(passenger.firstName as string | undefined) ?? ''} ${(passenger.lastName as string | undefined) ?? ''}`.trim()
            : (reservation.passengerId as string),
        };
      });

    return {
      ...trip,
      driverName: driver
        ? `${(driver.firstName as string | undefined) ?? ''} ${(driver.lastName as string | undefined) ?? ''}`.trim()
        : (trip.driverId as string),
      reservations: tripReservations,
      totalPassengers: tripReservations.filter((reservation) =>
        ['confirmed', 'in_progress', 'completed'].includes(reservation.status as string),
      ).length,
    };
  });

  return sortByDateDesc(
    enrichedTrips,
    (trip) => (trip.createdAt as string | undefined) ?? (trip.departureTime as string | undefined),
  );
}
