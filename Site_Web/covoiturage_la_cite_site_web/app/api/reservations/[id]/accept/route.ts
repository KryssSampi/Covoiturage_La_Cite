/**
 * POST /api/reservations/[id]/accept
 *
 * Accepte une réservation en attente :
 *  1. Passe la réservation de pending → confirmed
 *  2. Auto-annule les autres demandes pending du même passager (demandes multiples)
 *  3. Libère le holding 6$ pour chaque demande annulée
 *  4. Déclenche la pré-autorisation paiement (prix × 1.15 affiché au passager)
 *  5. Incrémente trip.currentPassengers (auto-full si maxPassengers atteint)
 *  6. Notifie le passager + les conducteurs concernés
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';
import { paymentService } from '@/server/services/PaymentService';

type Context = { params: Promise<{ id: string }> };
type ReservationRecord = Record<string, unknown>;
type TripRecord = Record<string, unknown>;

export async function POST(_req: Request, { params }: Context) {
  try {
    const { id } = await params;

    const reservation = persistenceManager.readById<ReservationRecord>('reservations', id);
    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }
    if (reservation.status !== 'pending') {
      return NextResponse.json({ error: "La réservation n'est pas en attente" }, { status: 409 });
    }

    const tripId = reservation.tripId as string;
    const trip   = persistenceManager.readById<TripRecord>('trips', tripId);
    if (!trip) {
      return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 });
    }
    if ((trip.currentPassengers as number) >= (trip.maxPassengers as number)) {
      return NextResponse.json({ error: 'Plus de places disponibles' }, { status: 409 });
    }

    const passengerId      = reservation.passengerId as string;
    const driverId         = reservation.driverId as string;
    const pricePerPassenger = trip.pricePerPassenger as number;
    const now  = new Date().toISOString();
    const year = new Date().getFullYear();

    // ── 1. Confirmer cette réservation ────────────────────────────────────────
    const updated = persistenceManager.updateItem<ReservationRecord>('reservations', id, {
      status: 'confirmed',
      confirmedAt: now,
    });

    // ── 2. Auto-annuler les autres demandes pending du même passager ──────────
    const allReservations = persistenceManager.readAll<ReservationRecord>('reservations');
    const autresDemandesDuPassager = allReservations.filter(
      (r) => r.passengerId === passengerId && r.id !== id && r.status === 'pending'
    );
    for (const autreRes of autresDemandesDuPassager) {
      persistenceManager.updateItem<ReservationRecord>('reservations', autreRes.id as string, {
        status: 'rejected',
        rejectedReason: 'Le passager a déjà trouvé un trajet.',
        updatedAt: now,
      });
      // Libération du holding 6$ pour chaque demande annulée
      paymentService.releaseHoldingAmount(passengerId, autreRes.id as string);
    }

    // ── 3. Incrémentation des passagers confirmés + statut auto-full ──────────
    const passengerIds   = [...((trip.passengerIds as string[]) ?? []), passengerId];
    const currentPassengers = (trip.currentPassengers as number) + 1;
    persistenceManager.updateItem<TripRecord>('trips', tripId, {
      passengerIds,
      currentPassengers,
      status: currentPassengers >= (trip.maxPassengers as number) ? 'full' : trip.status,
    });

    // ── 4. Pré-autorisation paiement ──────────────────────────────────────────
    const { prixAffiche } = paymentService.preAuthorizePayment(
      passengerId,
      driverId,
      pricePerPassenger,
      tripId,
      id
    );

    // ── 5. Notification passager ──────────────────────────────────────────────
    const rand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
    persistenceManager.addItem('notifications', {
      id:      `NTF-${year}-${rand}`,
      userId:  passengerId,
      type:    'reservation_accepted',
      title:   'Réservation confirmée !',
      message: `Votre demande a été acceptée. Prix total : ${prixAffiche.toFixed(2)}$ (frais de service inclus).`,
      isRead:  false,
      isImportant: true,
      relatedTripId:        tripId,
      relatedReservationId: id,
      createdAt: now,
    });

    // Notifications aux conducteurs dont les demandes ont été auto-annulées
    for (const autreRes of autresDemandesDuPassager) {
      const rand2 = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
      persistenceManager.addItem('notifications', {
        id:      `NTF-${year}-${rand2}`,
        userId:  autreRes.driverId as string,
        type:    'reservation_cancelled_auto',
        title:   'Demande annulée automatiquement',
        message: 'Le passager a trouvé un trajet. Sa demande a été annulée automatiquement.',
        isRead:  false,
        isImportant: false,
        relatedTripId:        autreRes.tripId,
        relatedReservationId: autreRes.id,
        createdAt: now,
      });
    }

    return NextResponse.json({
      reservation: updated,
      prixAffiche,
      autresDemandesAnnulees: autresDemandesDuPassager.length,
    });
  } catch (err) {
    console.error('[accept]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
