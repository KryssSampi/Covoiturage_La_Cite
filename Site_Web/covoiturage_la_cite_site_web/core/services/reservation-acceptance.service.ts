import { persistenceManager } from '@/tests/PersistenceManager';
import { paymentService } from '@/server/services/PaymentService';

type ReservationRecord = Record<string, unknown>;
type TripRecord = Record<string, unknown>;

export interface ReservationAcceptanceResult {
  reservation?: ReservationRecord;
  prixAffiche?: number;
  autresDemandesAnnulees?: number;
  error?: string;
  status?: number;
}

export function acceptReservationWorkflow(reservationId: string, callerId: string): ReservationAcceptanceResult {
  const reservation = persistenceManager.readById<ReservationRecord>('reservations', reservationId);
  if (!reservation) {
    return { error: 'Réservation introuvable', status: 404 };
  }
  if (reservation.status !== 'pending') {
    return { error: "La réservation n'est pas en attente", status: 409 };
  }

  const tripId = reservation.tripId as string;
  const trip = persistenceManager.readById<TripRecord>('trips', tripId);
  if (!trip) {
    return { error: 'Trajet introuvable', status: 404 };
  }

  // Seul le conducteur du trajet peut accepter une réservation.
  if (trip.driverId !== callerId) {
    return { error: 'Non autorisé', status: 403 };
  }

  if ((trip.currentPassengers as number) >= (trip.maxPassengers as number)) {
    return { error: 'Plus de places disponibles', status: 409 };
  }

  const passengerId = reservation.passengerId as string;
  const driverId = reservation.driverId as string;
  const pricePerPassenger = trip.pricePerPassenger as number;
  const now = new Date().toISOString();
  const year = new Date().getFullYear();

  const updated = persistenceManager.updateItem<ReservationRecord>('reservations', reservationId, {
    status: 'confirmed',
    confirmedAt: now,
  });

  const allReservations = persistenceManager.readAll<ReservationRecord>('reservations');
  const autresDemandesDuPassager = allReservations.filter(
    (item) => item.passengerId === passengerId && item.id !== reservationId && item.status === 'pending',
  );

  for (const autreReservation of autresDemandesDuPassager) {
    persistenceManager.updateItem<ReservationRecord>('reservations', autreReservation.id as string, {
      status: 'rejected',
      rejectedReason: 'Le passager a déjà trouvé un trajet.',
      updatedAt: now,
    });
    paymentService.releaseHoldingAmount(passengerId, autreReservation.id as string);
  }

  const passengerIds = [...((trip.passengerIds as string[]) ?? []), passengerId];
  const currentPassengers = (trip.currentPassengers as number) + 1;
  persistenceManager.updateItem<TripRecord>('trips', tripId, {
    passengerIds,
    currentPassengers,
    status: currentPassengers >= (trip.maxPassengers as number) ? 'full' : trip.status,
    updatedAt: now,
  });

  const { prixAffiche } = paymentService.preAuthorizePayment(
    passengerId,
    driverId,
    pricePerPassenger,
    tripId,
    reservationId,
  );

  const rand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
  persistenceManager.addItem('notifications', {
    id: `NTF-${year}-${rand}`,
    userId: passengerId,
    type: 'reservation_accepted',
    title: 'Réservation confirmée !',
    message: `Votre demande a été acceptée. Prix total : ${prixAffiche.toFixed(2)}$ (frais de service inclus).`,
    isRead: false,
    isImportant: true,
    relatedTripId: tripId,
    relatedReservationId: reservationId,
    createdAt: now,
  });

  for (const autreReservation of autresDemandesDuPassager) {
    const notificationRand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
    persistenceManager.addItem('notifications', {
      id: `NTF-${year}-${notificationRand}`,
      userId: autreReservation.driverId as string,
      type: 'reservation_cancelled_auto',
      title: 'Demande annulée automatiquement',
      message: 'Le passager a trouvé un trajet. Sa demande a été annulée automatiquement.',
      isRead: false,
      isImportant: false,
      relatedTripId: autreReservation.tripId,
      relatedReservationId: autreReservation.id,
      createdAt: now,
    });
  }

  return {
    reservation: updated ?? undefined,
    prixAffiche,
    autresDemandesAnnulees: autresDemandesDuPassager.length,
  };
}
