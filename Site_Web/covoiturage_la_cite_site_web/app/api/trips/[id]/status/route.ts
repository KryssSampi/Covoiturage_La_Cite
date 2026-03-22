/**
 * PATCH /api/trips/[id]/status
 * @body { action: 'start' | 'complete' | 'cancel' }
 *
 * Transitions d'état du trajet :
 *  - start    : published|confirmed → in_progress  + réservations confirmed → in_progress
 *  - complete : in_progress → completed             + réservations in_progress → completed
 *                                                   + capture du paiement pour chaque réservation
 *  - cancel   : tout état non terminé → cancelled  + réservations pending|confirmed → cancelled
 *                                                   + remboursements selon délai
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';
import { paymentService } from '@/server/services/PaymentService';

type Context = { params: Promise<{ id: string }> };
type TripRecord = Record<string, unknown>;
type ReservationRecord = Record<string, unknown>;

const ACTION_MAP: Record<string, { tripStatus: string; fromRes: string[]; toRes: string }> = {
  start:    { tripStatus: 'in_progress', fromRes: ['confirmed'],          toRes: 'in_progress' },
  complete: { tripStatus: 'completed',   fromRes: ['in_progress'],        toRes: 'completed'   },
  cancel:   { tripStatus: 'cancelled',   fromRes: ['pending','confirmed'], toRes: 'cancelled'   },
};

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const { action } = (await req.json()) as { action: string };

    const mapping = ACTION_MAP[action];
    if (!mapping) {
      return NextResponse.json({ error: 'Action invalide (start|complete|cancel)' }, { status: 400 });
    }

    const trip = persistenceManager.readById<TripRecord>('trips', id);
    if (!trip) return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 });

    // Met à jour le statut du trajet
    const updatedTrip = persistenceManager.updateItem<TripRecord>('trips', id, {
      status: mapping.tripStatus,
    });

    // Met à jour les réservations liées
    const reservations = persistenceManager.readAll<ReservationRecord>('reservations');
    for (const res of reservations) {
      if (
        res.tripId === id &&
        mapping.fromRes.includes(res.status as string)
      ) {
        persistenceManager.updateItem<ReservationRecord>('reservations', res.id as string, {
          status: mapping.toRes,
        });

        // ── Capture du paiement à la fin du trajet ───────────────────────────
        if (action === 'complete' && res.passengerId && trip.driverId && trip.pricePerPassenger) {
          paymentService.capturePayment(
            res.passengerId as string,
            trip.driverId as string,
            trip.pricePerPassenger as number,
            id,
            res.id as string
          );
        }

        // ── Remboursement passager en cas d'annulation ───────────────────────
        if (action === 'cancel' && res.passengerId && trip.driverId && trip.pricePerPassenger) {
          const departAt = trip.departureTime ?? trip.departAt ?? trip.scheduledFor;
          const minAvant = departAt
            ? Math.floor((new Date(departAt as string).getTime() - Date.now()) / 60000)
            : 9999;
          paymentService.refundPassenger(
            res.passengerId as string,
            trip.driverId as string,
            trip.pricePerPassenger as number,
            id,
            res.id as string,
            minAvant
          );
        }
      }
    }

    return NextResponse.json(updatedTrip);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
