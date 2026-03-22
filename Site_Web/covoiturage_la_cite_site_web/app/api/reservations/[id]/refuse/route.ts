/**
 * POST /api/reservations/[id]/refuse
 *
 * Refuse une réservation en attente :
 *  1. Passe la réservation de pending → rejected
 *  2. Libère le holding 6$ si c'était la dernière demande active du passager
 *  3. Notifie le passager
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';
import { paymentService } from '@/server/services/PaymentService';

type Context = { params: Promise<{ id: string }> };
type ReservationRecord = Record<string, unknown>;

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({})) as { raison?: string };

    const reservation = persistenceManager.readById<ReservationRecord>('reservations', id);
    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }
    if (reservation.status !== 'pending') {
      return NextResponse.json({ error: "La réservation n'est pas en attente" }, { status: 409 });
    }

    const passengerId = reservation.passengerId as string;
    const now  = new Date().toISOString();
    const year = new Date().getFullYear();

    // ── 1. Refuser la réservation ─────────────────────────────────────────────
    const updated = persistenceManager.updateItem<ReservationRecord>('reservations', id, {
      status: 'rejected',
      rejectedReason: body.raison ?? 'Refusé par le conducteur',
      updatedAt: now,
    });

    // ── 2. Vérifier s'il reste d'autres demandes pending du même passager ─────
    const allReservations = persistenceManager.readAll<ReservationRecord>('reservations');
    const autresDemandesActives = allReservations.filter(
      (r) => r.passengerId === passengerId && r.id !== id && r.status === 'pending'
    );

    // Si aucune autre demande active → libérer le holding 6$
    if (autresDemandesActives.length === 0) {
      paymentService.releaseHoldingAmount(passengerId, id);
    }

    // ── 3. Notification passager ──────────────────────────────────────────────
    const rand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
    persistenceManager.addItem('notifications', {
      id:      `NTF-${year}-${rand}`,
      userId:  passengerId,
      type:    'reservation_refused',
      title:   'Demande refusée',
      message: body.raison
        ? `Le conducteur a refusé votre demande : ${body.raison}`
        : 'Votre demande de covoiturage a été refusée par le conducteur.',
      isRead:  false,
      isImportant: false,
      relatedTripId:        reservation.tripId,
      relatedReservationId: id,
      createdAt: now,
    });

    return NextResponse.json({
      reservation: updated,
      holdingLibere: autresDemandesActives.length === 0,
    });
  } catch (err) {
    console.error('[refuse]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
