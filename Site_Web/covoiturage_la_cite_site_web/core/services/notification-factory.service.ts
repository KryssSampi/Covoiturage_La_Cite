/**
 * notification-factory.service.ts
 *
 * Factory centralisée pour créer des NotificationModel typées et enrichies.
 * Utilisée par toutes les routes API qui génèrent des notifications.
 *
 * Usage (serveur uniquement) :
 *   import { notifReservationReceived } from '@/core/services/notification-factory.service';
 *   const notif = notifReservationReceived({ driverId, passenger, trip, reservation });
 *   persistenceManager.addItem('notifications', notif);
 */

import { generatePrefixedId, nowIso } from '@/core/utils/api-route.utils';
import type { NotificationModel, NotificationType } from '@/core/models/NotificationModel';
import type { TripModel } from '@/core/models/TripModel';
import type { ReservationModel } from '@/core/models/ReservationModel';
import type { UserModel } from '@/core/models/UserModel';
import type { ReviewModel } from '@/core/models/ReviewModel';

// ─── Base builder ─────────────────────────────────────────────────────────────

function base(
  fields: Omit<NotificationModel, 'id' | 'createdAt'> & Partial<Pick<NotificationModel, 'id' | 'createdAt'>>,
): NotificationModel {
  return {
    id: fields.id ?? generatePrefixedId('NTF'),
    createdAt: fields.createdAt ?? nowIso(),
    isRead: false,
    isImportant: false,
    ...fields,
  };
}

function passengerPrice(trip: TripModel): number {
  return trip.passengerPrice ?? Math.round(trip.pricePerPassenger * 1.15 * 100) / 100;
}

// ─── 1. Conducteur : nouvelle demande de réservation ─────────────────────────

export function notifReservationReceived(params: {
  driverId: string;
  passenger: UserModel;
  driver: UserModel;
  trip: TripModel;
  reservation: ReservationModel;
}): NotificationModel {
  const { driverId, passenger, driver, trip, reservation } = params;
  return base({
    userId: driverId,
    type: 'reservation_received',
    title: 'Nouvelle demande de réservation',
    message:
      `${passenger.firstName} ${passenger.lastName} (${passenger.passengerProfile?.averageRating ?? '?'}★ — ` +
      `${passenger.passengerProfile?.totalTripsAsPassenger ?? 0} trajet${(passenger.passengerProfile?.totalTripsAsPassenger ?? 0) > 1 ? 's' : ''}) ` +
      `souhaite rejoindre votre trajet ${trip.departure.label} → ${trip.arrival.label} ` +
      `le ${trip.departureDate} à ${trip.departureTime}. ` +
      `Consultez son profil et acceptez ou refusez la demande avant qu'elle expire.`,
    isImportant: true,
    link: `/driver/reservations/${driverId}`,
    linkLabel: 'Voir les demandes',
    relatedTripId: trip.id,
    relatedReservationId: reservation.id,
    tripDetails: {
      tripId: trip.id,
      departure: trip.departure.label,
      arrival: trip.arrival.label,
      date: trip.departureDate,
      time: trip.departureTime,
      price: trip.pricePerPassenger,
      availableSeats: trip.maxPassengers - trip.currentPassengers,
      estimatedDurationMinutes: trip.estimatedDurationMinutes,
    },
    reservationDetails: {
      reservationId: reservation.id,
      passengerName: `${passenger.firstName} ${passenger.lastName}`,
      passengerRating: passenger.passengerProfile?.averageRating,
      passengerTripCount: passenger.passengerProfile?.totalTripsAsPassenger,
      driverName: `${driver.firstName} ${driver.lastName}`,
    },
  });
}

// ─── 2. Passager : accusé de réception — demande envoyée avec succès ──────────

export function notifReservationSent(params: {
  passengerId: string;
  driver: UserModel;
  trip: TripModel;
  reservation: ReservationModel;
}): NotificationModel {
  const { passengerId, driver, trip, reservation } = params;
  const price = passengerPrice(trip);
  return base({
    userId: passengerId,
    type: 'reservation_sent',
    title: 'Demande envoyée avec succès',
    message:
      `Votre demande pour le trajet ${trip.departure.label} → ${trip.arrival.label} ` +
      `(${trip.departureDate} à ${trip.departureTime}) a bien été transmise à ${driver.firstName}. ` +
      `Prix confirmé : ${price.toFixed(2)} $ (frais inclus). ` +
      `Vous serez notifié dès qu'il aura répondu.`,
    isImportant: false,
    link: `/passenger/planifier/${passengerId}?tripId=${trip.id}&mode=all`,
    linkLabel: 'Voir ma demande',
    relatedTripId: trip.id,
    relatedReservationId: reservation.id,
    tripDetails: {
      tripId: trip.id,
      departure: trip.departure.label,
      arrival: trip.arrival.label,
      date: trip.departureDate,
      time: trip.departureTime,
      price,
      estimatedDurationMinutes: trip.estimatedDurationMinutes,
    },
    reservationDetails: {
      reservationId: reservation.id,
      driverName: `${driver.firstName} ${driver.lastName}`,
    },
  });
}

// ─── 3. Passager : réservation acceptée ──────────────────────────────────────

export function notifReservationAccepted(params: {
  passengerId: string;
  driver: UserModel;
  trip: TripModel;
  reservation: ReservationModel;
}): NotificationModel {
  const { passengerId, driver, trip, reservation } = params;
  const price = passengerPrice(trip);
  return base({
    userId: passengerId,
    type: 'reservation_accepted',
    title: 'Réservation confirmée !',
    message:
      `${driver.firstName} a accepté votre demande pour le trajet ${trip.departure.label} → ${trip.arrival.label} ` +
      `le ${trip.departureDate} à ${trip.departureTime}. ` +
      `Votre place est garantie — montant : ${price.toFixed(2)} $ (frais inclus). ` +
      `Préparez-vous à arriver quelques minutes avant le départ.`,
    isImportant: true,
    link: `/passenger/planifier/${passengerId}?tripId=${trip.id}&mode=all`,
    linkLabel: 'Voir le trajet',
    relatedTripId: trip.id,
    relatedReservationId: reservation.id,
    tripDetails: {
      tripId: trip.id,
      departure: trip.departure.label,
      arrival: trip.arrival.label,
      date: trip.departureDate,
      time: trip.departureTime,
      price,
      availableSeats: trip.maxPassengers - trip.currentPassengers,
      estimatedDurationMinutes: trip.estimatedDurationMinutes,
    },
    reservationDetails: {
      reservationId: reservation.id,
      driverName: `${driver.firstName} ${driver.lastName}`,
    },
  });
}

// ─── 4. Passager : réservation refusée ───────────────────────────────────────

export function notifReservationRefused(params: {
  passengerId: string;
  driver: UserModel;
  trip: TripModel;
  reservation: ReservationModel;
}): NotificationModel {
  const { passengerId, driver, trip, reservation } = params;
  return base({
    userId: passengerId,
    type: 'reservation_refused',
    title: 'Demande non retenue',
    message:
      `${driver.firstName} n'a pas retenu votre demande pour le trajet ` +
      `${trip.departure.label} → ${trip.arrival.label} du ${trip.departureDate}. ` +
      `${reservation.refusalReason ? `Motif : "${reservation.refusalReason}". ` : ''}` +
      `Des alternatives sont disponibles — cherchez un autre trajet.`,
    isImportant: false,
    link: `/passenger/search/${passengerId}`,
    linkLabel: 'Chercher un autre trajet',
    relatedTripId: trip.id,
    relatedReservationId: reservation.id,
    tripDetails: {
      tripId: trip.id,
      departure: trip.departure.label,
      arrival: trip.arrival.label,
      date: trip.departureDate,
      time: trip.departureTime,
      price: passengerPrice(trip),
    },
    reservationDetails: {
      reservationId: reservation.id,
      driverName: `${driver.firstName} ${driver.lastName}`,
    },
  });
}

// ─── 5. Les deux : réservation annulée ───────────────────────────────────────

export function notifReservationCancelled(params: {
  recipientId: string;
  recipientRole: 'driver' | 'passenger';
  cancelledBy: 'passenger' | 'driver';
  trip: TripModel;
  reservation: ReservationModel;
  passenger: UserModel;
  driver: UserModel;
}): NotificationModel {
  const { recipientId, recipientRole, cancelledBy, trip, reservation, passenger, driver } = params;
  const isDriver = recipientRole === 'driver';
  const cancellerName = cancelledBy === 'passenger' ? passenger.firstName : driver.firstName;
  return base({
    userId: recipientId,
    type: 'reservation_cancelled',
    title: 'Réservation annulée',
    message: isDriver
      ? `${cancellerName} a annulé sa réservation pour votre trajet ` +
        `${trip.departure.label} → ${trip.arrival.label} du ${trip.departureDate}. ` +
        `Une place s'est libérée — d'autres passagers peuvent désormais rejoindre le trajet.`
      : `${cancellerName} a annulé le trajet ${trip.departure.label} → ${trip.arrival.label} ` +
        `prévu le ${trip.departureDate}. ` +
        `${reservation.cancellationReason ? `Motif : "${reservation.cancellationReason}". ` : ''}` +
        `Cherchez une alternative parmi les trajets disponibles.`,
    isImportant: !isDriver,
    link: isDriver
      ? `/driver/reservations/${recipientId}`
      : `/passenger/search/${recipientId}`,
    linkLabel: isDriver ? 'Voir mes réservations' : 'Chercher un autre trajet',
    relatedTripId: trip.id,
    relatedReservationId: reservation.id,
    tripDetails: {
      tripId: trip.id,
      departure: trip.departure.label,
      arrival: trip.arrival.label,
      date: trip.departureDate,
      time: trip.departureTime,
      price: isDriver ? trip.pricePerPassenger : passengerPrice(trip),
    },
    reservationDetails: {
      reservationId: reservation.id,
      passengerName: `${passenger.firstName} ${passenger.lastName}`,
      driverName: `${driver.firstName} ${driver.lastName}`,
    },
  });
}

// ─── 6. Conducteur : trajet créé avec succès ─────────────────────────────────

export function notifTripCreated(params: {
  driverId: string;
  trip: TripModel;
}): NotificationModel {
  const { driverId, trip } = params;
  const price = passengerPrice(trip);
  return base({
    userId: driverId,
    type: 'trip_created',
    title: 'Trajet publié avec succès !',
    message:
      `Votre trajet ${trip.departure.label} → ${trip.arrival.label} ` +
      `du ${trip.departureDate} à ${trip.departureTime} est maintenant visible par les passagers. ` +
      `${trip.maxPassengers} place${trip.maxPassengers > 1 ? 's' : ''} disponible${trip.maxPassengers > 1 ? 's' : ''} — ` +
      `tarif passager affiché : ${price.toFixed(2)} $ (frais de service inclus).`,
    isImportant: false,
    link: `/trajets/${trip.id}`,
    linkLabel: 'Voir le trajet',
    relatedTripId: trip.id,
    tripDetails: {
      tripId: trip.id,
      departure: trip.departure.label,
      arrival: trip.arrival.label,
      date: trip.departureDate,
      time: trip.departureTime,
      price: trip.pricePerPassenger,
      availableSeats: trip.maxPassengers,
      estimatedDurationMinutes: trip.estimatedDurationMinutes,
    },
  });
}

// ─── 7. Les deux : rappel départ imminent (< 1 h) ────────────────────────────

export function notifTripStartingSoon(params: {
  recipientId: string;
  recipientRole: 'driver' | 'passenger';
  trip: TripModel;
}): NotificationModel {
  const { recipientId, recipientRole, trip } = params;
  const isDriver = recipientRole === 'driver';
  return base({
    userId: recipientId,
    type: 'trip_starting_soon',
    title: 'Départ imminent !',
    message: isDriver
      ? `Votre trajet ${trip.departure.label} → ${trip.arrival.label} démarre à ${trip.departureTime}. ` +
        `Préparez votre véhicule et rejoignez le point de départ dans les plus brefs délais.`
      : `Le trajet ${trip.departure.label} → ${trip.arrival.label} part à ${trip.departureTime}. ` +
        `Rejoignez le point de rendez-vous dès maintenant pour ne pas manquer le départ.`,
    isImportant: true,
    link: `/trajet-en-cours/${trip.id}`,
    linkLabel: 'Suivre le trajet',
    relatedTripId: trip.id,
    tripDetails: {
      tripId: trip.id,
      departure: trip.departure.label,
      arrival: trip.arrival.label,
      date: trip.departureDate,
      time: trip.departureTime,
      price: isDriver ? trip.pricePerPassenger : passengerPrice(trip),
    },
  });
}

// ─── 8. Passager : conducteur a démarré le trajet ────────────────────────────

export function notifTripStarted(params: {
  passengerId: string;
  driver: UserModel;
  trip: TripModel;
}): NotificationModel {
  const { passengerId, driver, trip } = params;
  return base({
    userId: passengerId,
    type: 'trip_started',
    title: 'Trajet en cours !',
    message:
      `${driver.firstName} a démarré le trajet ${trip.departure.label} → ${trip.arrival.label}. ` +
      `Si vous n'êtes pas encore au point de rendez-vous, rejoignez-le immédiatement.`,
    isImportant: true,
    link: `/trajet-en-cours/${trip.id}`,
    linkLabel: 'Suivre le trajet',
    relatedTripId: trip.id,
    tripDetails: {
      tripId: trip.id,
      departure: trip.departure.label,
      arrival: trip.arrival.label,
      date: trip.departureDate,
      time: trip.departureTime,
      price: passengerPrice(trip),
    },
  });
}

// ─── 9. Les deux : trajet terminé ─────────────────────────────────────────────

export function notifTripCompleted(params: {
  recipientId: string;
  recipientRole: 'driver' | 'passenger';
  trip: TripModel;
  reservation?: ReservationModel;
}): NotificationModel {
  const { recipientId, recipientRole, trip, reservation } = params;
  const isDriver = recipientRole === 'driver';
  return base({
    userId: recipientId,
    type: 'trip_completed',
    title: 'Trajet terminé !',
    message: isDriver
      ? `Votre trajet ${trip.departure.label} → ${trip.arrival.label} est terminé avec succès. ` +
        `Merci pour votre contribution ! N'oubliez pas de laisser un avis à vos passagers.`
      : `Le trajet ${trip.departure.label} → ${trip.arrival.label} est terminé. ` +
        `Merci d'avoir covoituré ! Partagez votre expérience en laissant un avis au conducteur.`,
    isImportant: false,
    link: `/trajets/${trip.id}`,
    linkLabel: 'Voir le résumé',
    relatedTripId: trip.id,
    relatedReservationId: reservation?.id,
    tripDetails: {
      tripId: trip.id,
      departure: trip.departure.label,
      arrival: trip.arrival.label,
      date: trip.departureDate,
      time: trip.departureTime,
      price: isDriver ? trip.pricePerPassenger : passengerPrice(trip),
      estimatedDurationMinutes: trip.estimatedDurationMinutes,
    },
  });
}

// ─── 10. Passager : trajet annulé par le conducteur ──────────────────────────

export function notifTripCancelled(params: {
  passengerId: string;
  driver: UserModel;
  trip: TripModel;
}): NotificationModel {
  const { passengerId, driver, trip } = params;
  return base({
    userId: passengerId,
    type: 'trip_cancelled',
    title: 'Trajet annulé',
    message:
      `${driver.firstName} a annulé le trajet ${trip.departure.label} → ${trip.arrival.label} ` +
      `prévu le ${trip.departureDate} à ${trip.departureTime}. ` +
      `Nous vous invitons à chercher une alternative parmi les trajets disponibles.`,
    isImportant: true,
    link: `/passenger/search/${passengerId}`,
    linkLabel: 'Chercher un autre trajet',
    relatedTripId: trip.id,
    tripDetails: {
      tripId: trip.id,
      departure: trip.departure.label,
      arrival: trip.arrival.label,
      date: trip.departureDate,
      time: trip.departureTime,
      price: passengerPrice(trip),
    },
  });
}

// ─── 11. Les deux : nouvel avis reçu ─────────────────────────────────────────

export function notifNewReviewReceived(params: {
  recipientId: string;
  recipientRole: 'driver' | 'passenger';
  reviewer: UserModel;
  review: ReviewModel;
  trip: TripModel;
}): NotificationModel {
  const { recipientId, recipientRole, reviewer, review, trip } = params;
  const stars = '★'.repeat(Math.round(review.rating)) + '☆'.repeat(5 - Math.round(review.rating));
  const sentiment = review.rating >= 4.5 ? 'excellent' : review.rating >= 3.5 ? 'positif' : 'mitigé';
  return base({
    userId: recipientId,
    type: 'new_review_received',
    title: 'Nouvel avis reçu',
    message:
      `${reviewer.firstName} vous a laissé un avis ${sentiment} (${stars} — ${review.rating}/5) ` +
      `après le trajet ${trip.departure.label} → ${trip.arrival.label} du ${trip.departureDate}. ` +
      `${review.comment ? `"${review.comment.slice(0, 100)}${review.comment.length > 100 ? '…' : ''}"` : ''}`,
    isImportant: false,
    link: `/${recipientRole}/reviews/${recipientId}?reviewId=${review.id}`,
    linkLabel: "Voir l'avis",
    relatedTripId: trip.id,
    relatedReservationId: review.reservationId,
    reviewDetails: {
      reviewId: review.id,
      reviewerName: `${reviewer.firstName} ${reviewer.lastName}`,
      rating: review.rating,
      comment: review.comment.slice(0, 120),
    },
  });
}

// ─── 12. Les deux : pénalité d'annulation appliquée ──────────────────────────

export function notifCancellationPenalty(params: {
  recipientId: string;
  recipientRole: 'driver' | 'passenger';
  penaltyAmount: number;
  reason: string;
  trip?: TripModel;
}): NotificationModel {
  const { recipientId, recipientRole, penaltyAmount, reason, trip } = params;
  return base({
    userId: recipientId,
    type: 'cancellation_penalty',
    title: 'Pénalité appliquée',
    message:
      `Une pénalité de ${penaltyAmount.toFixed(2)} $ a été appliquée à votre compte. ` +
      `Motif : ${reason}. ` +
      `${trip ? `Trajet concerné : ${trip.departure.label} → ${trip.arrival.label} du ${trip.departureDate}. ` : ''}` +
      `Consultez votre espace finances pour les détails et options de contestation.`,
    isImportant: true,
    link: `/${recipientRole}/finances/${recipientId}`,
    linkLabel: 'Voir les pénalités',
    relatedTripId: trip?.id,
    tripDetails: trip
      ? {
          tripId: trip.id,
          departure: trip.departure.label,
          arrival: trip.arrival.label,
          date: trip.departureDate,
          time: trip.departureTime,
          price: recipientRole === 'driver' ? trip.pricePerPassenger : passengerPrice(trip),
        }
      : undefined,
  });
}

// ─── 13. Les deux : alerte de sécurité ───────────────────────────────────────

export function notifSecurityAlert(params: {
  recipientId: string;
  clientType: 'web' | 'mobile';
  userAgent?: string;
  location?: string;
}): NotificationModel {
  const { recipientId, clientType, userAgent, location } = params;
  return base({
    userId: recipientId,
    type: 'security_alert',
    title: 'Nouvelle connexion détectée',
    message:
      `Une connexion ${clientType === 'web' ? 'depuis un navigateur web' : 'via l\'application mobile'} ` +
      `a été enregistrée sur votre compte${location ? ` depuis ${location}` : ''}. ` +
      `Si vous n'êtes pas à l'origine de cette connexion, sécurisez immédiatement votre compte.`,
    isImportant: true,
    link: `/settings/security`,
    linkLabel: "Voir l'activité récente",
    securityDetails: {
      clientType,
      location,
      userAgent,
    },
  });
}

// ─── 14. Système générique ────────────────────────────────────────────────────

export function notifSystem(params: {
  recipientId: string;
  title: string;
  message: string;
  link?: string;
  linkLabel?: string;
  isImportant?: boolean;
}): NotificationModel {
  const { recipientId, title, message, link, linkLabel, isImportant } = params;
  return base({
    userId: recipientId,
    type: 'system',
    title,
    message: link
      ? `${message} Suivez le lien attaché pour plus d'informations.`
      : message,
    isImportant: isImportant ?? false,
    link,
    linkLabel: link ? (linkLabel ?? 'Suivre le lien attaché') : undefined,
  });
}

// ─── Export regroupé (pratique pour l'import) ─────────────────────────────────

export const NotificationFactory = {
  reservationReceived:  notifReservationReceived,
  reservationSent:      notifReservationSent,
  reservationAccepted:  notifReservationAccepted,
  reservationRefused:   notifReservationRefused,
  reservationCancelled: notifReservationCancelled,
  tripCreated:          notifTripCreated,
  tripStartingSoon:     notifTripStartingSoon,
  tripStarted:          notifTripStarted,
  tripCompleted:        notifTripCompleted,
  tripCancelled:        notifTripCancelled,
  newReviewReceived:    notifNewReviewReceived,
  cancellationPenalty:  notifCancellationPenalty,
  securityAlert:        notifSecurityAlert,
  system:               notifSystem,
} as const;
