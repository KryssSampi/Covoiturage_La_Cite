import { persistenceManager } from '@/tests/PersistenceManager';
import { paymentService }      from '@/server/services/PaymentService';

// ─── Types ────────────────────────────────────────────────────────────────────

export type SimulationEvent =
  | 'retard_15_30'
  | 'retard_30_60'
  | 'retard_60plus'
  | 'annulation_conducteur'
  | 'no_show_conducteur'
  | 'no_show_passager'
  | 'trajet_complete'
  | 'litige'
  | 'accident';

export interface SimulationParams {
  reservationId?: string;
}

export interface SimulationResult {
  success:              boolean;
  event:                SimulationEvent;
  tripId:               string;
  message:              string;
  penalite:             { montant: number; pointsReputation: number; suspension?: string } | null;
  affectedReservations: number;
}

export type SimulationError = { error: string; status: number };

export const VALID_EVENTS: SimulationEvent[] = [
  'retard_15_30', 'retard_30_60', 'retard_60plus',
  'annulation_conducteur', 'no_show_conducteur', 'no_show_passager',
  'trajet_complete', 'litige', 'accident',
];

// ─── Types internes ───────────────────────────────────────────────────────────

type TripRecord        = Record<string, unknown>;
type ReservationRecord = Record<string, unknown>;
type PenaliteResult    = { montant: number; pointsReputation: number; suspension?: string };

// ─── runSimulation ────────────────────────────────────────────────────────────

export function runSimulation(
  tripId:  string,
  event:   SimulationEvent,
  params:  SimulationParams = {},
): SimulationResult | SimulationError {

  const trip = persistenceManager.readById<TripRecord>('trips', tripId);
  if (!trip) return { error: 'Trajet introuvable', status: 404 };

  const driverId    = trip.driverId    as string;
  const pricePerPax = (trip.pricePerPassenger as number) ?? 0;

  const allReservations   = persistenceManager.readAll<ReservationRecord>('reservations');
  const activeReservations = allReservations.filter(
    (r) => r.tripId === tripId && ['confirmed', 'in_progress', 'pending'].includes(r.status as string)
  );
  const activeIds = activeReservations.map((r) => r.id as string);

  let message:       string         = '';
  let penalite:      PenaliteResult | null = null;

  switch (event) {

    // ── Retards conducteur ────────────────────────────────────────────────
    case 'retard_15_30':
    case 'retard_30_60': {
      penalite = paymentService.applyDriverPenalty(driverId, event, tripId, activeIds);
      message  = `Pénalité retard appliquée : ${penalite.montant}$ débités du conducteur`;
      break;
    }

    case 'retard_60plus': {
      penalite = paymentService.applyDriverPenalty(driverId, 'retard_60plus', tripId, activeIds);
      _cancelAllAndRefund(activeReservations, driverId, pricePerPax, tripId);
      persistenceManager.updateItem<TripRecord>('trips', tripId, { status: 'cancelled', updatedAt: new Date().toISOString() });
      message = 'Retard > 60 min : trajet annulé, passagers remboursés à 100%';
      break;
    }

    // ── Annulation conducteur ─────────────────────────────────────────────
    case 'annulation_conducteur': {
      penalite = paymentService.applyDriverPenalty(driverId, 'annulation_tardive', tripId, activeIds);
      const departAt  = trip.departureTime ?? trip.departAt ?? trip.scheduledFor;
      const minAvant  = departAt
        ? Math.floor((new Date(departAt as string).getTime() - Date.now()) / 60000)
        : 9999;
      _cancelAllAndRefund(activeReservations, driverId, pricePerPax, tripId, minAvant);
      persistenceManager.updateItem<TripRecord>('trips', tripId, { status: 'cancelled', updatedAt: new Date().toISOString() });
      message = `Annulation conducteur : pénalité ${penalite.montant}$, passagers remboursés`;
      break;
    }

    // ── No-show conducteur ────────────────────────────────────────────────
    case 'no_show_conducteur': {
      penalite = paymentService.applyDriverPenalty(driverId, 'no_show', tripId, activeIds);
      _cancelAllAndRefund(activeReservations, driverId, pricePerPax, tripId);
      persistenceManager.updateItem<TripRecord>('trips', tripId, { status: 'cancelled', updatedAt: new Date().toISOString() });
      message = `No-show conducteur : pénalité ${penalite.montant}$, suspension 7 jours, passagers remboursés`;
      break;
    }

    // ── No-show passager ──────────────────────────────────────────────────
    case 'no_show_passager': {
      const targetRes = params.reservationId
        ? allReservations.find((r) => r.id === params.reservationId)
        : activeReservations.find((r) => ['confirmed', 'in_progress'].includes(r.status as string));

      if (!targetRes) return { error: 'Aucune réservation active trouvée pour ce trajet', status: 404 };

      paymentService.applyPassengerPenalty(
        targetRes.passengerId as string, driverId, pricePerPax,
        tripId, targetRes.id as string, 'no_show'
      );
      persistenceManager.updateItem<ReservationRecord>('reservations', targetRes.id as string, {
        status: 'cancelled', updatedAt: new Date().toISOString(),
      });
      message = `No-show passager (${targetRes.passengerId}) : pénalité appliquée, 85% versé au conducteur`;
      break;
    }

    // ── Trajet complété ───────────────────────────────────────────────────
    case 'trajet_complete': {
      for (const res of activeReservations) {
        persistenceManager.updateItem<ReservationRecord>('reservations', res.id as string, {
          status: 'completed', updatedAt: new Date().toISOString(),
        });
        if (res.passengerId) {
          paymentService.capturePayment(
            res.passengerId as string, driverId, pricePerPax, tripId, res.id as string
          );
        }
      }
      persistenceManager.updateItem<TripRecord>('trips', tripId, { status: 'completed', updatedAt: new Date().toISOString() });
      message = `Trajet complété : paiement capturé pour ${activeReservations.length} passager(s)`;
      break;
    }

    // ── Litige ────────────────────────────────────────────────────────────
    case 'litige': {
      penalite = paymentService.applyDriverPenalty(driverId, 'signalement_valide', tripId, activeIds);
      message  = `Signalement validé : pénalité ${penalite.montant}$, suspension 30 jours`;
      break;
    }

    // ── Accident ──────────────────────────────────────────────────────────
    case 'accident': {
      _cancelAllAndRefund(activeReservations, driverId, pricePerPax, tripId);
      persistenceManager.updateItem<TripRecord>('trips', tripId, { status: 'cancelled', updatedAt: new Date().toISOString() });
      message = 'Accident : trajet annulé, remboursement 100% pour tous les passagers';
      break;
    }
  }

  return {
    success:              true,
    event,
    tripId,
    message,
    penalite,
    affectedReservations: activeIds.length,
  };
}

// ─── Helper interne ───────────────────────────────────────────────────────────

function _cancelAllAndRefund(
  reservations: ReservationRecord[],
  driverId:     string,
  pricePerPax:  number,
  tripId:       string,
  minutesAvant: number = 9999,
) {
  for (const res of reservations) {
    persistenceManager.updateItem<ReservationRecord>('reservations', res.id as string, {
      status: 'cancelled', updatedAt: new Date().toISOString(),
    });
    if (res.passengerId) {
      paymentService.refundPassenger(
        res.passengerId as string, driverId, pricePerPax,
        tripId, res.id as string, minutesAvant
      );
    }
  }
}
