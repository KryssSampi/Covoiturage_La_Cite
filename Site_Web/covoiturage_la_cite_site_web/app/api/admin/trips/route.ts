/**
 * GET /api/admin/trips
 *
 * Retourne tous les trajets avec les informations enrichies
 * (nom du conducteur, passagers, statut des réservations).
 * Réservé à l'administration.
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

type TripRecord = Record<string, unknown>;
type ReservationRecord = Record<string, unknown>;
type UserRecord = { id: string; firstName?: string; lastName?: string; email?: string; role?: string };

// Type d'une réservation enrichie avec le nom du passager
type EnrichedReservation = ReservationRecord & { passengerName: string };

// Type d'un trajet enrichi avec les champs admin
type EnrichedTrip = TripRecord & {
  driverName: string;
  reservations: EnrichedReservation[];
  totalPassengers: number;
};

export async function GET() {
  try {
    const trips        = persistenceManager.readAll<TripRecord>('trips');
    const reservations = persistenceManager.readAll<ReservationRecord>('reservations');
    const users        = persistenceManager.readAll<UserRecord>('users');

    // Indexe les utilisateurs pour éviter les recherches répétées
    const userMap = new Map(users.map((u) => [u.id, u]));

    const enrichedTrips: EnrichedTrip[] = trips.map((trip) => {
      // Récupère les informations du conducteur
      const driver = userMap.get(trip.driverId as string);

      // Récupère les réservations associées avec le nom du passager
      const tripReservations: EnrichedReservation[] = reservations
        .filter((r) => r.tripId === trip.id)
        .map((r): EnrichedReservation => {
          const passenger = userMap.get(r.passengerId as string);
          return {
            ...r,
            passengerName: passenger
              ? `${passenger.firstName ?? ''} ${passenger.lastName ?? ''}`.trim()
              : (r.passengerId as string),
          };
        });

      return {
        ...trip,
        driverName: driver
          ? `${driver.firstName ?? ''} ${driver.lastName ?? ''}`.trim()
          : (trip.driverId as string),
        reservations: tripReservations,
        totalPassengers: tripReservations.filter(
          (r) => r.status === 'confirmed' || r.status === 'in_progress' || r.status === 'completed'
        ).length,
      };
    });

    // Trie les trajets du plus récent au plus ancien
    enrichedTrips.sort((a, b) => {
      const dateA = new Date((a.createdAt ?? a.departureTime ?? '') as string).getTime();
      const dateB = new Date((b.createdAt ?? b.departureTime ?? '') as string).getTime();
      return dateB - dateA;
    });

    return NextResponse.json(enrichedTrips);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
