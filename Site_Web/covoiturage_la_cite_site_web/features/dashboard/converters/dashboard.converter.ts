import { isImminent } from '@/core/utils/trip-time.utils';
import type { TripModel } from '@/core/models/TripModel';
import type { UserModel } from '@/core/models/UserModel';
import type { ReservationModel } from '@/core/models/ReservationModel';
import type { NotificationModel } from '@/core/models/NotificationModel';
import type { ReviewModel } from '@/core/models/ReviewModel';

// Types UI du dashboard
import type {
  Trip,
  Reservation,
  PublishedTrip,
  ReservationRequest,
  Applicant,
  Destination,
} from '@/features/dashboard/types';
import { ReservationStatus } from '@/features/dashboard/types';
import { PublishedTripStatus } from '@/features/dashboard/types';
import {
  NotificationType as DashboardNotificationType,
} from '@/features/dashboard/types';
import type { Notification, Review } from '@/features/dashboard/types';

/**
 * Convertisseurs dashboard
 * Transforment les modÃ¨les core en types attendus par les composants dashboard.
 * Tous les IDs sont conservÃ©s en tant que strings (format "TRJ-2026-00001").
 */

/** Construit un Driver/Passenger (UserProfile) depuis un UserModel */
function toUserProfile(user: UserModel) {
  return {
    id: user.id,
    pictureUrl: user.avatarUrl ?? '',
    name: `${user.firstName} ${user.lastName}`,
    rating: user.passengerProfile.averageRating,
    tripsCount: user.passengerProfile.totalTripsAsPassenger,
  };
}

/**
 * Convertit un TripModel en Trip (vue passager â€” trajets recommandÃ©s)
 */
export function tripModelToTrip(trip: TripModel, driver: UserModel, passengers: UserModel[]): Trip {
  return {
    id: trip.id,
    departure: trip.departure.label,
    destination: trip.arrival.label,
    date: trip.departureDate,
    time: trip.departureTime,
    price: trip.pricePerPassenger,
    maxPassengers: trip.maxPassengers,
    passengers: passengers.map(toUserProfile),
    driver: {
      id: driver.id,
      pictureUrl: driver.avatarUrl ?? '',
      name: `${driver.firstName} ${driver.lastName}`,
      rating: driver.driverProfile?.averageRating ?? 4.5,
      tripsCount: driver.driverProfile?.totalTripsAsDriver ?? 0,
    },
    doneDate: null,
    departureCoords:
      trip.departure.coordinates
        ? [trip.departure.coordinates.lng, trip.departure.coordinates.lat]
        : undefined,
    arrivalCoords:
      trip.arrival.coordinates
        ? [trip.arrival.coordinates.lng, trip.arrival.coordinates.lat]
        : undefined,
    latLngs: trip.polyline.length > 0 ? trip.polyline : undefined,
    isImminent: isImminent(trip),
  };
}

/**
 * Convertit un TripModel + rÃ©servation en Reservation (vue passager â€” mes rÃ©servations)
 */
export function tripModelToReservation(
  trip: TripModel,
  reservation: ReservationModel,
  driver: UserModel
): Reservation {
  const statusMap: Record<ReservationModel['status'], ReservationStatus> = {
    pending:     ReservationStatus.Pending,
    confirmed:   ReservationStatus.Confirmed,
    refused:     ReservationStatus.Rejected,
    cancelled:   ReservationStatus.Cancelled,
    in_progress: ReservationStatus.InProgress,
    completed:   ReservationStatus.Completed,
    no_show:     ReservationStatus.Cancelled,
  };

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
    status: statusMap[reservation.status] ?? ReservationStatus.Pending,
    doneDate: reservation.completedAt ?? null,
    isImminent: isImminent(trip),
  };
}

/**
 * Convertit un TripModel en PublishedTrip (vue conducteur â€” mes trajets publiÃ©s)
 */
export function tripModelToPublishedTrip(
  trip: TripModel,
  passengers: UserModel[],
  pendingCount: number
): PublishedTrip {
  const statusMap: Record<TripModel['status'], PublishedTripStatus> = {
    draft:       PublishedTripStatus.Published,
    published:   PublishedTripStatus.Published,
    full:        PublishedTripStatus.Full,
    confirmed:   PublishedTripStatus.Confirmed,
    in_progress: PublishedTripStatus.InProgress,
    completed:   PublishedTripStatus.Completed,
    cancelled:   PublishedTripStatus.Cancelled,
    no_show:     PublishedTripStatus.NoShow,
  };

  // Logique confirmed → full : si passagers confirmés == places totales
  let status = statusMap[trip.status] ?? PublishedTripStatus.Published;
  if (
    (trip.status === 'confirmed' || trip.status === 'published') &&
    passengers.length >= trip.maxPassengers
  ) {
    status = PublishedTripStatus.Full;
  }

  return {
    id: trip.id,
    driverId: trip.driverId,
    departure: trip.departure.label,
    destination: trip.arrival.label,
    date: trip.departureDate,
    time: trip.departureTime,
    duration: trip.estimatedDurationMinutes ?? 0,
    maxPassengers: trip.maxPassengers,
    passengers: passengers.map(toUserProfile),
    price: trip.pricePerPassenger,
    pendingRequests: pendingCount,
    status,
    departureCoords:
      trip.departure.coordinates
        ? [trip.departure.coordinates.lng, trip.departure.coordinates.lat]
        : undefined,
    arrivalCoords:
      trip.arrival.coordinates
        ? [trip.arrival.coordinates.lng, trip.arrival.coordinates.lat]
        : undefined,
    isImminent: isImminent(trip),
  };
}

/**
 * Convertit une ReservationModel en ReservationRequest (vue conducteur â€” demandes reÃ§ues)
 */
export function reservationModelToRequest(
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

/**
 * Convertit un TripModel en Destination (vue passager â€” destinations rÃ©centes/habituelles)
 */
export function tripModelToDestination(trip: TripModel, matchingDriversCount: number): Destination {
  return {
    id: trip.id,
    departure: trip.departure.label,
    destination: trip.arrival.label,
    disponibility: trip.maxPassengers - trip.currentPassengers,
    favoriteDriverCount: matchingDriversCount,
    departureCoords: trip.departure.coordinates
      ? [trip.departure.coordinates.lng, trip.departure.coordinates.lat]
      : undefined,
    arrivalCoords: trip.arrival.coordinates
      ? [trip.arrival.coordinates.lng, trip.arrival.coordinates.lat]
      : undefined,
  };
}

/**
 * Correspondance type backend â†’ type UI notification
 */
const NOTIFICATION_TYPE_MAP: Record<NotificationModel['type'], DashboardNotificationType> = {
  reservation_received:  DashboardNotificationType.Confirmation,
  reservation_accepted:  DashboardNotificationType.Confirmation,
  reservation_refused:   DashboardNotificationType.Annulation,
  reservation_cancelled: DashboardNotificationType.Annulation,
  trip_starting_soon:    DashboardNotificationType.UrgentRappel,
  trip_started:          DashboardNotificationType.Infos,
  trip_completed:        DashboardNotificationType.Infos,
  trip_cancelled:        DashboardNotificationType.Annulation,
  boarding_requested:    DashboardNotificationType.UrgentRappel,
  new_review_received:   DashboardNotificationType.NouvelleAvis,
  cancellation_penalty:  DashboardNotificationType.UrgentRappel,
  security_alert:        DashboardNotificationType.UrgentRappel,
  system:                DashboardNotificationType.Infos,
};

/**
 * Convertit un NotificationModel en Notification (type UI dashboard).
 * Mappe tous les champs du modÃ¨le, y compris userId et isImportant pour le filtrage.
 */
export function notificationModelToNotification(n: NotificationModel): Notification {
  const d = new Date(n.createdAt);
  return {
    id: n.id,
    userId: n.userId,
    title: n.title,
    type: NOTIFICATION_TYPE_MAP[n.type] ?? DashboardNotificationType.Infos,
    message: n.message,
    date: d.toISOString().slice(0, 10),
    time: d.toTimeString().slice(0, 5),
    isRead: n.isRead,
    isImportant: n.isImportant,
    relatedTripId: n.relatedTripId ?? null,
    relatedReservationId: n.relatedReservationId ?? null,
    createdAt: n.createdAt,
    link: n.link,
  };
}

/**
 * Convertit un ReviewModel en Review (type UI dashboard).
 * Conserve revieweeId pour permettre le filtrage par destinataire.
 */
export function reviewModelToReview(
  r: ReviewModel,
  reviewer: UserModel | undefined
): Review {
  return {
    id: r.id,
    reviewer: reviewer
      ? `${reviewer.firstName} ${reviewer.lastName}`
      : 'Membre La CitÃ©',
    reviewerId: r.reviewerId,
    revieweeId: r.revieweeId,
    reviewerpicture: reviewer?.avatarUrl ?? '',
    rating: r.rating,
    date: r.createdAt.slice(0, 10),
    comment: r.comment ?? '',
    tags: r.tags ?? [],
    tripId: r.tripId ?? null,
    createdAt: r.createdAt,
  };
}
