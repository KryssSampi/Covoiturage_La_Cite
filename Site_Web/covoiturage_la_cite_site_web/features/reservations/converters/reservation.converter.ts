import type { ReservationModel } from '@/core/models/ReservationModel';
import type { TripModel } from '@/core/models/TripModel';
import type { UserModel } from '@/core/models/UserModel';

// Types dashboard pour les réservations conducteur/passager
import type {
  Reservation,
  ReservationRequest,
  Applicant,
} from '@/features/dashboard/types';
import { ReservationStatus } from '@/features/dashboard/types';

/**
 * Convertisseurs reservations
 * Transforment les modèles core en types attendus par
 * DriverReservationsPage et PassengerReservationsPage
 */

const RESERVATION_STATUS_MAP: Record<ReservationModel['status'], ReservationStatus> = {
  pending:     ReservationStatus.Pending,
  confirmed:   ReservationStatus.Confirmed,
  refused:     ReservationStatus.Rejected,
  cancelled:   ReservationStatus.Cancelled,
  in_progress: ReservationStatus.InProgress,
  completed:   ReservationStatus.Completed,
  no_show:     ReservationStatus.Cancelled,
};

/**
 * Convertit une paire ReservationModel + TripModel en Reservation (vue passager)
 */
export function reservationToPassengerView(
  reservation: ReservationModel,
  trip: TripModel,
  driver: UserModel
): Reservation {
  return {
    id: reservation.id,
    tripId: trip.id,
    departure: trip.departure.label,
    destination: trip.arrival.label,
    date: trip.departureDate,
    time: trip.departureTime,
    duration: trip.estimatedDurationMinutes ?? 0,
    maxPassengers: trip.maxPassengers,
    passengers: [],
    driver: {
      id: driver.id,
      pictureUrl: driver.avatarUrl ?? '',
      name: `${driver.firstName} ${driver.lastName}`,
      rating: driver.driverProfile?.averageRating ?? 4.5,
      tripsCount: driver.driverProfile?.totalTripsAsDriver ?? 0,
    },
    status: RESERVATION_STATUS_MAP[reservation.status] ?? ReservationStatus.Pending,
    doneDate: reservation.completedAt ?? null,
    isImminent: isImminent(trip),
  };
}

/**
 * Convertit une paire ReservationModel + TripModel + UserModel passager
 * en ReservationRequest (vue conducteur)
 */
export function reservationToDriverRequest(
  reservation: ReservationModel,
  trip: TripModel,
  passenger: UserModel
): ReservationRequest {
  const applicant: Applicant = {
    id: passenger.id,
    urlPicture: passenger.avatarUrl ?? '',
    name: `${passenger.firstName} ${passenger.lastName}`,
    note: passenger.passengerProfile.averageRating,
    doneTrips: passenger.passengerProfile.totalTripsAsPassenger,
  };

  return {
    id: reservation.id,
    applicant,
    departure: trip.departure.label,
    destination: trip.arrival.label,
    date: trip.departureDate,
    time: trip.departureTime,
    maxPassengers: trip.maxPassengers,
    currentPassengers: trip.currentPassengers,
    price: trip.pricePerPassenger,
  };
}

function isImminent(trip: TripModel): boolean {
  const now = new Date();
  const dep = new Date(`${trip.departureDate}T${trip.departureTime}:00`);
  const diffH = (dep.getTime() - now.getTime()) / (1000 * 60 * 60);
  return diffH >= 0 && diffH <= 2;
}
