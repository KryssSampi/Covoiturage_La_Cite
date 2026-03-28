import { paymentService } from '@/server/services/PaymentService';
import { persistenceManager } from '@/tests/PersistenceManager';

type TripRecord = Record<string, unknown>;
type ReservationRecord = Record<string, unknown>;

const ACTION_MAP: Record<string, { tripStatus: string; fromRes: string[]; toRes: string }> = {
  start: { tripStatus: 'in_progress', fromRes: ['confirmed'], toRes: 'in_progress' },
  complete: { tripStatus: 'completed', fromRes: ['in_progress'], toRes: 'completed' },
  cancel: { tripStatus: 'cancelled', fromRes: ['pending', 'confirmed'], toRes: 'cancelled' },
};

export function getTripById(id: string): TripRecord | null {
  return persistenceManager.readById<TripRecord>('trips', id);
}

export function patchTripById(id: string, patch: Record<string, unknown>): TripRecord | null {
  return persistenceManager.updateItem<TripRecord>('trips', id, patch);
}

export function deleteTripById(id: string): void {
  persistenceManager.deleteItem('trips', id);
}

export function resolveTripStatusAction(action: string) {
  return ACTION_MAP[action];
}

export function applyTripStatusAction(id: string, action: string): TripRecord | null {
  const mapping = ACTION_MAP[action];
  if (!mapping) {
    return null;
  }

  const trip = persistenceManager.readById<TripRecord>('trips', id);
  if (!trip) {
    return null;
  }

  const updatedTrip = persistenceManager.updateItem<TripRecord>('trips', id, {
    status: mapping.tripStatus,
  });

  // Le démarrage d'un trajet ne cascade pas sur les réservations (seul le passager démarre sa propre réservation).
  if (action === 'start') {
    return updatedTrip ?? null;
  }

  const reservations = persistenceManager.readAll<ReservationRecord>('reservations');
  for (const reservation of reservations) {
    if (reservation.tripId !== id || !mapping.fromRes.includes(reservation.status as string)) {
      continue;
    }

    persistenceManager.updateItem<ReservationRecord>('reservations', reservation.id as string, {
      status: mapping.toRes,
    });

    if (action === 'complete' && reservation.passengerId && trip.driverId && trip.pricePerPassenger) {
      paymentService.capturePayment(
        reservation.passengerId as string,
        trip.driverId as string,
        trip.pricePerPassenger as number,
        id,
        reservation.id as string,
      );
    }

    if (action === 'cancel' && reservation.passengerId && trip.driverId && trip.pricePerPassenger) {
      const departureAt = trip.departureTime ?? trip.departAt ?? trip.scheduledFor;
      const minutesBeforeDeparture = departureAt
        ? Math.floor((new Date(departureAt as string).getTime() - Date.now()) / 60000)
        : 9999;

      paymentService.refundPassenger(
        reservation.passengerId as string,
        trip.driverId as string,
        trip.pricePerPassenger as number,
        id,
        reservation.id as string,
        minutesBeforeDeparture,
      );
    }
  }

  return updatedTrip ?? null;
}
