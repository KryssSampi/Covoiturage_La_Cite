/**
 * POST /api/reservations/[id]/cancel
 *
 * Annulation d'une réservation par le passager :
 *  1. Vérifie que la réservation est annulable (pending ou confirmed)
 *  2. Passe le statut à « cancelled »
 *  3. Si la réservation était confirmée, retire le passager du trajet
 *  4. Libère la retenue de 6$ sur le compte du passager
 *  5. Notifie le conducteur de l'annulation
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';
import { paymentService } from '@/server/services/PaymentService';

type Context = { params: Promise<{ id: string }> };
type ReservationRecord = Record<string, unknown>;
type TripRecord = Record<string, unknown>;

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({})) as { raison?: string };

    const reservation = persistenceManager.readById<ReservationRecord>('reservations', id);
    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    // Seules les réservations en attente ou confirmées peuvent être annulées
    const cancellableStatuses = ['pending', 'confirmed'];
    if (!cancellableStatuses.includes(reservation.status as string)) {
      return NextResponse.json(
        { error: 'Cette réservation ne peut plus être annulée' },
        { status: 409 }
      );
    }

    const passengerId = reservation.passengerId as string;
    const driverId    = reservation.driverId as string;
    const tripId      = reservation.tripId as string;
    const wasCofirmed = reservation.status === 'confirmed';
    const now  = new Date().toISOString();
    const year = new Date().getFullYear();

    // ── 1. Annuler la réservation ─────────────────────────────────────────────
    const updated = persistenceManager.updateItem<ReservationRecord>('reservations', id, {
      status: 'cancelled',
      cancelledAt: now,
      cancellationReason: body.raison ?? 'Annulée par le passager',
      updatedAt: now,
    });

    // ── 2. Si confirmée : retirer le passager du trajet ───────────────────────
    if (wasCofirmed && tripId) {
      const trip = persistenceManager.readById<TripRecord>('trips', tripId);
      if (trip) {
        const passengerIds = ((trip.passengerIds as string[]) ?? []).filter(
          (pid) => pid !== passengerId
        );
        const currentPassengers = Math.max(0, (trip.currentPassengers as number) - 1);
        persistenceManager.updateItem<TripRecord>('trips', tripId, {
          passengerIds,
          currentPassengers,
          // Rouvrir le trajet si il était plein
          status: (trip.status === 'full') ? 'published' : trip.status,
        });
      }
    }

    // ── 3. Libérer la retenue de sécurité (6$) ───────────────────────────────
    paymentService.releaseHoldingAmount(passengerId, id);

    // ── 4. Notifier le conducteur ─────────────────────────────────────────────
    const rand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
    persistenceManager.addItem('notifications', {
      id:      `NTF-${year}-${rand}`,
      userId:  driverId,
      type:    'reservation_cancelled',
      title:   'Réservation annulée',
      message: body.raison
        ? `Un passager a annulé sa réservation : ${body.raison}`
        : 'Un passager a annulé sa réservation.',
      isRead:  false,
      isImportant: false,
      relatedTripId:        tripId,
      relatedReservationId: id,
      createdAt: now,
    });

    return NextResponse.json({
      reservation: updated,
      tripUpdated: wasCofirmed,
    });
  } catch (err) {
    console.error('[cancel]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
