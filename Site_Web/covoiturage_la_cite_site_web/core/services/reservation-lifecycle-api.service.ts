import { generatePrefixedId, nowIso } from '@/core/utils/api-route.utils';
import { paymentService } from '@/server/services/PaymentService';
import { persistenceManager } from '@/tests/PersistenceManager';

type ReservationRecord = Record<string, unknown>;
type TripRecord = Record<string, unknown>;

function addLifecycleNotification(payload: {
  userId: string;
  type: string;
  title: string;
  message: string;
  relatedTripId?: string;
  relatedReservationId?: string;
  isImportant?: boolean;
}) {
  persistenceManager.addItem('notifications', {
    id: generatePrefixedId('NTF'),
    userId: payload.userId,
    type: payload.type,
    title: payload.title,
    message: payload.message,
    isRead: false,
    isImportant: payload.isImportant ?? false,
    relatedTripId: payload.relatedTripId,
    relatedReservationId: payload.relatedReservationId,
    createdAt: nowIso(),
  });
}

export interface ReservationLifecycleResult {
  reservation?: ReservationRecord | null;
  tripUpdated?: boolean;
  holdingLibere?: boolean;
  tripId?: string;
  error?: string;
  status?: number;
}

export function cancelReservationWorkflow(
  reservationId: string,
  callerId: string,
  reason?: string,
): ReservationLifecycleResult {
  const reservation = persistenceManager.readById<ReservationRecord>('reservations', reservationId);
  if (!reservation) {
    return { error: 'Reservation introuvable', status: 404 };
  }

  // Seul le passager concerné peut annuler sa propre réservation.
  if (reservation.passengerId !== callerId) {
    return { error: 'Non autorisé', status: 403 };
  }

  const cancellableStatuses = ['pending', 'confirmed'];
  if (!cancellableStatuses.includes(reservation.status as string)) {
    return { error: 'Cette reservation ne peut plus etre annulee', status: 409 };
  }

  const passengerId = reservation.passengerId as string;
  const driverId = reservation.driverId as string;
  const tripId = reservation.tripId as string;
  const wasConfirmed = reservation.status === 'confirmed';
  const now = nowIso();

  const updated = persistenceManager.updateItem<ReservationRecord>('reservations', reservationId, {
    status: 'cancelled',
    cancelledAt: now,
    cancellationReason: reason ?? 'Annulee par le passager',
    updatedAt: now,
  });

  if (wasConfirmed && tripId) {
    const trip = persistenceManager.readById<TripRecord>('trips', tripId);
    if (trip) {
      const passengerIds = ((trip.passengerIds as string[]) ?? []).filter((id) => id !== passengerId);
      const currentPassengers = Math.max(0, (trip.currentPassengers as number) - 1);
      persistenceManager.updateItem<TripRecord>('trips', tripId, {
        passengerIds,
        currentPassengers,
        status: trip.status === 'full' ? 'published' : trip.status,
        updatedAt: now,
      });
    }
  }

  paymentService.releaseHoldingAmount(passengerId, reservationId);

  addLifecycleNotification({
    userId: driverId,
    type: 'reservation_cancelled',
    title: 'Reservation annulee',
    message: reason
      ? `Un passager a annule sa reservation : ${reason}`
      : 'Un passager a annule sa reservation.',
    relatedTripId: tripId,
    relatedReservationId: reservationId,
  });

  return {
    reservation: updated,
    tripUpdated: wasConfirmed,
  };
}

export function refuseReservationWorkflow(
  reservationId: string,
  callerId: string,
  reason?: string,
): ReservationLifecycleResult {
  const reservation = persistenceManager.readById<ReservationRecord>('reservations', reservationId);
  if (!reservation) {
    return { error: 'Reservation introuvable', status: 404 };
  }

  // Seul le conducteur du trajet peut refuser une réservation.
  if (reservation.driverId !== callerId) {
    return { error: 'Non autorisé', status: 403 };
  }

  if (reservation.status !== 'pending') {
    return { error: "La reservation n'est pas en attente", status: 409 };
  }

  const passengerId = reservation.passengerId as string;
  const now = nowIso();
  const updated = persistenceManager.updateItem<ReservationRecord>('reservations', reservationId, {
    status: 'rejected',
    rejectedReason: reason ?? 'Refuse par le conducteur',
    updatedAt: now,
  });

  const allReservations = persistenceManager.readAll<ReservationRecord>('reservations');
  const autresDemandesActives = allReservations.filter(
    (item) => item.passengerId === passengerId && item.id !== reservationId && item.status === 'pending',
  );

  const holdingLibere = autresDemandesActives.length === 0;
  if (holdingLibere) {
    paymentService.releaseHoldingAmount(passengerId, reservationId);
  }

  addLifecycleNotification({
    userId: passengerId,
    type: 'reservation_refused',
    title: 'Demande refusee',
    message: reason
      ? `Le conducteur a refuse votre demande : ${reason}`
      : 'Votre demande de covoiturage a ete refusee par le conducteur.',
    relatedTripId: reservation.tripId as string | undefined,
    relatedReservationId: reservationId,
  });

  return {
    reservation: updated,
    holdingLibere,
  };
}

export function rejectReservationWorkflow(reservationId: string, callerId: string): ReservationLifecycleResult {
  const reservation = persistenceManager.readById<ReservationRecord>('reservations', reservationId);
  if (!reservation) {
    return { error: 'Reservation introuvable', status: 404 };
  }

  // Seul le conducteur du trajet peut rejeter une réservation.
  if (reservation.driverId !== callerId) {
    return { error: 'Non autorisé', status: 403 };
  }

  if (reservation.status !== 'pending') {
    return { error: "La reservation n'est pas en attente", status: 409 };
  }

  const passengerId = reservation.passengerId as string;
  const updated = persistenceManager.updateItem<ReservationRecord>('reservations', reservationId, {
    status: 'refused',
    refusalReason: 'Refusee par le conducteur',
    updatedAt: nowIso(),
  });

  paymentService.releaseHoldingAmount(passengerId, reservationId);

  addLifecycleNotification({
    userId: passengerId,
    type: 'reservation_refused',
    title: 'Demande refusee',
    message: 'Votre demande de reservation a ete refusee par le conducteur.',
    relatedTripId: reservation.tripId as string | undefined,
    relatedReservationId: reservationId,
  });

  return { reservation: updated };
}

export function startReservationWorkflow(reservationId: string, callerId: string): ReservationLifecycleResult {
  const reservation = persistenceManager.readById<ReservationRecord>('reservations', reservationId);
  if (!reservation) {
    return { error: 'Reservation introuvable', status: 404 };
  }

  // Seul le conducteur du trajet peut démarrer le trajet.
  if (reservation.driverId !== callerId) {
    return { error: 'Non autorisé', status: 403 };
  }

  if (reservation.status !== 'confirmed') {
    return { error: 'Seules les reservations confirmees peuvent etre demarrees', status: 409 };
  }

  const tripId = reservation.tripId as string;
  const now = nowIso();

  const updatedReservation = persistenceManager.updateItem<ReservationRecord>('reservations', reservationId, {
    status: 'in_progress',
    updatedAt: now,
  });

  if (tripId) {
    const trip = persistenceManager.readById<TripRecord>('trips', tripId);
    if (trip && trip.status !== 'in_progress') {
      persistenceManager.updateItem<TripRecord>('trips', tripId, {
        status: 'in_progress',
        updatedAt: now,
      });
    }
  }

  return {
    reservation: updatedReservation,
    tripId,
  };
}
