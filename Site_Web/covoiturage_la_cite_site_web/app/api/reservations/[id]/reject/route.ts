/**
 * POST /api/reservations/[id]/reject
 *
 * Rejette une demande de réservation en attente :
 *  1. Vérifie que la réservation existe et est en statut "pending"
 *  2. Passe le statut à "refused"
 *  3. Libère le holding 6$ du passager
 *  4. Notifie le passager du refus
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';
import { paymentService } from '@/server/services/PaymentService';

type Context = { params: Promise<{ id: string }> };
type ReservationRecord = Record<string, unknown>;

export async function POST(_req: Request, { params }: Context) {
  try {
    const { id } = await params;

    // Lecture de la réservation
    const reservation = persistenceManager.readById<ReservationRecord>('reservations', id);
    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }
    if (reservation.status !== 'pending') {
      return NextResponse.json(
        { error: "La réservation n'est pas en attente" },
        { status: 409 },
      );
    }

    const passengerId = reservation.passengerId as string;
    const now = new Date().toISOString();
    const year = new Date().getFullYear();

    // ── 1. Passer la réservation à "refused" ──────────────────────────────────
    const updated = persistenceManager.updateItem<ReservationRecord>('reservations', id, {
      status: 'refused',
      refusalReason: 'Refusée par le conducteur',
      updatedAt: now,
    });

    // ── 2. Libérer le holding 6$ du passager ──────────────────────────────────
    paymentService.releaseHoldingAmount(passengerId, id);

    // ── 3. Notifier le passager ───────────────────────────────────────────────
    const rand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
    persistenceManager.addItem('notifications', {
      id: `NTF-${year}-${rand}`,
      userId: passengerId,
      type: 'reservation_refused',
      title: 'Demande refusée',
      message: 'Votre demande de réservation a été refusée par le conducteur.',
      isRead: false,
      isImportant: false,
      relatedTripId: reservation.tripId,
      relatedReservationId: id,
      createdAt: now,
    });

    return NextResponse.json({ reservation: updated });
  } catch (err) {
    console.error('[reject]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
