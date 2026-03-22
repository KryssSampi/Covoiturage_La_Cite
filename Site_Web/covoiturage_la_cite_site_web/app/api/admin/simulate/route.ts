/**
 * POST /api/admin/simulate
 * @body { tripId: string; event: SimulationEvent; params?: SimulationParams }
 *
 * Simule un événement sur un trajet existant avec impact réel sur les données JSON.
 * Tous les événements du manifeste fonctionnel sont supportés.
 *
 * Événements disponibles :
 *  - retard_15_30         : Retard conducteur 15–30 min        → pénalité 5$
 *  - retard_30_60         : Retard conducteur 30–60 min        → pénalité 10$
 *  - retard_60plus        : Retard > 60 min                    → auto-cancel + refund
 *  - annulation_conducteur: Annulation du conducteur           → pénalité 15$ + refund passagers
 *  - no_show_conducteur   : Conducteur absent                  → pénalité 50$ + 7j suspension
 *  - no_show_passager     : Passager absent                    → pénalité plein prix au passager
 *  - trajet_complete      : Marque le trajet comme terminé     → capture du paiement
 *  - litige               : Signalement validé conducteur      → pénalité 100$ + 30j suspension
 *  - accident             : Force-annule + remboursement 100%
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';
import { paymentService } from '@/server/services/PaymentService';

type SimulationEvent =
  | 'retard_15_30'
  | 'retard_30_60'
  | 'retard_60plus'
  | 'annulation_conducteur'
  | 'no_show_conducteur'
  | 'no_show_passager'
  | 'trajet_complete'
  | 'litige'
  | 'accident';

interface SimulationParams {
  /** Pour no_show_passager : id spécifique de la réservation */
  reservationId?: string;
}

interface SimulationBody {
  tripId: string;
  event: SimulationEvent;
  params?: SimulationParams;
}

type TripRecord = Record<string, unknown>;
type ReservationRecord = Record<string, unknown>;

const VALID_EVENTS: SimulationEvent[] = [
  'retard_15_30', 'retard_30_60', 'retard_60plus',
  'annulation_conducteur', 'no_show_conducteur', 'no_show_passager',
  'trajet_complete', 'litige', 'accident',
];

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<SimulationBody>;

    if (!body.tripId || !body.event) {
      return NextResponse.json({ error: 'Paramètres tripId et event requis' }, { status: 400 });
    }
    if (!VALID_EVENTS.includes(body.event as SimulationEvent)) {
      return NextResponse.json(
        { error: `Événement invalide. Valeurs acceptées : ${VALID_EVENTS.join(', ')}` },
        { status: 400 }
      );
    }

    const tripId = body.tripId;
    const event  = body.event as SimulationEvent;
    const params = body.params ?? {};

    // ── Récupération du trajet ────────────────────────────────────────────────
    const trip = persistenceManager.readById<TripRecord>('trips', tripId);
    if (!trip) {
      return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 });
    }

    const driverId   = trip.driverId as string;
    const pricePerPax = trip.pricePerPassenger as number ?? 0;

    // ── Réservations actives du trajet ────────────────────────────────────────
    const allReservations = persistenceManager.readAll<ReservationRecord>('reservations');
    const activeReservations = allReservations.filter(
      (r) => r.tripId === tripId && ['confirmed', 'in_progress', 'pending'].includes(r.status as string)
    );
    const activeIds = activeReservations.map((r) => r.id as string);

    let resultMessage = '';
    let penaliteResult: { montant: number; pointsReputation: number; suspension?: string } | null = null;

    switch (event) {
      // ── Retards conducteur ─────────────────────────────────────────────────
      case 'retard_15_30':
      case 'retard_30_60': {
        penaliteResult = paymentService.applyDriverPenalty(driverId, event, tripId, activeIds);
        resultMessage = `Pénalité retard appliquée : ${penaliteResult.montant}$ débités du conducteur`;
        break;
      }

      case 'retard_60plus': {
        penaliteResult = paymentService.applyDriverPenalty(driverId, 'retard_60plus', tripId, activeIds);

        // Auto-annulation du trajet + remboursement complet de tous les passagers
        for (const res of activeReservations) {
          persistenceManager.updateItem<ReservationRecord>('reservations', res.id as string, {
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
          });
          if (res.passengerId) {
            paymentService.refundPassenger(
              res.passengerId as string, driverId, pricePerPax,
              tripId, res.id as string, 9999
            );
          }
        }
        persistenceManager.updateItem<TripRecord>('trips', tripId, {
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        });
        resultMessage = 'Retard > 60 min : trajet annulé, passagers remboursés à 100%';
        break;
      }

      // ── Annulation conducteur ──────────────────────────────────────────────
      case 'annulation_conducteur': {
        penaliteResult = paymentService.applyDriverPenalty(driverId, 'annulation_tardive', tripId, activeIds);

        const departAt = trip.departureTime ?? trip.departAt ?? trip.scheduledFor;
        const minAvant = departAt
          ? Math.floor((new Date(departAt as string).getTime() - Date.now()) / 60000)
          : 9999;

        for (const res of activeReservations) {
          persistenceManager.updateItem<ReservationRecord>('reservations', res.id as string, {
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
          });
          if (res.passengerId) {
            paymentService.refundPassenger(
              res.passengerId as string, driverId, pricePerPax,
              tripId, res.id as string, minAvant
            );
          }
        }
        persistenceManager.updateItem<TripRecord>('trips', tripId, {
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        });
        resultMessage = `Annulation conducteur : pénalité ${penaliteResult.montant}$, passagers remboursés`;
        break;
      }

      // ── No-show conducteur ────────────────────────────────────────────────
      case 'no_show_conducteur': {
        penaliteResult = paymentService.applyDriverPenalty(driverId, 'no_show', tripId, activeIds);

        for (const res of activeReservations) {
          persistenceManager.updateItem<ReservationRecord>('reservations', res.id as string, {
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
          });
          if (res.passengerId) {
            paymentService.refundPassenger(
              res.passengerId as string, driverId, pricePerPax,
              tripId, res.id as string, 9999
            );
          }
        }
        persistenceManager.updateItem<TripRecord>('trips', tripId, {
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        });
        resultMessage = `No-show conducteur : pénalité ${penaliteResult.montant}$, suspension 7 jours, passagers remboursés`;
        break;
      }

      // ── No-show passager ──────────────────────────────────────────────────
      case 'no_show_passager': {
        // Si reservationId fourni, applique au passager spécifique, sinon au premier confirmé
        const targetRes = params.reservationId
          ? allReservations.find((r) => r.id === params.reservationId)
          : activeReservations.find((r) => ['confirmed', 'in_progress'].includes(r.status as string));

        if (!targetRes) {
          return NextResponse.json({ error: 'Aucune réservation active trouvée pour ce trajet' }, { status: 404 });
        }
        paymentService.applyPassengerPenalty(
          targetRes.passengerId as string,
          driverId,
          pricePerPax,
          tripId,
          targetRes.id as string,
          'no_show'
        );
        persistenceManager.updateItem<ReservationRecord>('reservations', targetRes.id as string, {
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        });
        resultMessage = `No-show passager (${targetRes.passengerId}) : pénalité appliquée, 85% versé au conducteur`;
        break;
      }

      // ── Trajet complété ───────────────────────────────────────────────────
      case 'trajet_complete': {
        for (const res of activeReservations) {
          persistenceManager.updateItem<ReservationRecord>('reservations', res.id as string, {
            status: 'completed',
            updatedAt: new Date().toISOString(),
          });
          if (res.passengerId) {
            paymentService.capturePayment(
              res.passengerId as string, driverId, pricePerPax,
              tripId, res.id as string
            );
          }
        }
        persistenceManager.updateItem<TripRecord>('trips', tripId, {
          status: 'completed',
          updatedAt: new Date().toISOString(),
        });
        resultMessage = `Trajet complété : paiement capturé pour ${activeReservations.length} passager(s)`;
        break;
      }

      // ── Litige / Signalement validé ───────────────────────────────────────
      case 'litige': {
        penaliteResult = paymentService.applyDriverPenalty(driverId, 'signalement_valide', tripId, activeIds);
        resultMessage = `Signalement validé : pénalité ${penaliteResult.montant}$, suspension 30 jours`;
        break;
      }

      // ── Accident (force-annulation + remboursement 100%) ─────────────────
      case 'accident': {
        for (const res of activeReservations) {
          persistenceManager.updateItem<ReservationRecord>('reservations', res.id as string, {
            status: 'cancelled',
            updatedAt: new Date().toISOString(),
          });
          if (res.passengerId) {
            paymentService.refundPassenger(
              res.passengerId as string, driverId, pricePerPax,
              tripId, res.id as string, 9999
            );
          }
        }
        persistenceManager.updateItem<TripRecord>('trips', tripId, {
          status: 'cancelled',
          updatedAt: new Date().toISOString(),
        });
        resultMessage = 'Accident : trajet annulé, remboursement 100% pour tous les passagers';
        break;
      }
    }

    return NextResponse.json({
      success: true,
      event,
      tripId,
      message: resultMessage,
      penalite: penaliteResult,
      affectedReservations: activeIds.length,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
