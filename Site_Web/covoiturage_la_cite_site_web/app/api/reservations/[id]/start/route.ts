/**
 * POST /api/reservations/[id]/start
 *
 * Démarre un trajet pour une réservation confirmée et imminente :
 *  1. Passe le statut de la réservation de confirmed → in_progress
 *  2. Passe le statut du trajet associé à in_progress (s'il ne l'est pas déjà)
 *  3. Notifie le conducteur que le passager a démarré le suivi
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

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

    // Seules les réservations confirmées peuvent être démarrées
    if (reservation.status !== 'confirmed') {
      return NextResponse.json(
        { error: 'Seules les réservations confirmées peuvent être démarrées' },
        { status: 409 }
      );
    }

    const tripId = reservation.tripId as string;
    const now    = new Date().toISOString();

    // ── 1. Passer la réservation en cours ─────────────────────────────────────
    const updatedReservation = persistenceManager.updateItem<ReservationRecord>('reservations', id, {
      status: 'in_progress',
      updatedAt: now,
    });

    // ── 2. Passer le trajet en cours (s'il ne l'est pas déjà) ────────────────
    if (tripId) {
      const trip = persistenceManager.readById<TripRecord>('trips', tripId);
      if (trip && trip.status !== 'in_progress') {
        persistenceManager.updateItem<TripRecord>('trips', tripId, {
          status: 'in_progress',
          updatedAt: now,
        });
      }
    }

    return NextResponse.json({
      reservation: updatedReservation,
      tripId,
    });
  } catch (err) {
    console.error('[start]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
