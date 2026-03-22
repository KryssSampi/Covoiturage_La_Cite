/**
 * GET  /api/reservations   — Liste des réservations (filtrée par passengerId ou driverId)
 * POST /api/reservations   — Création d'une réservation (+ blocage holding 6$ passager)
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';
import { paymentService } from '@/server/services/PaymentService';

type ReservationRecord = Record<string, unknown>;
type TripRecord = Record<string, unknown>;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const passengerId = searchParams.get('passengerId');
    const driverId    = searchParams.get('driverId');
    const status      = searchParams.get('status');

    let reservations = persistenceManager.readAll<ReservationRecord>('reservations');

    if (passengerId) reservations = reservations.filter((r) => r.passengerId === passengerId);
    if (driverId)    reservations = reservations.filter((r) => r.driverId    === driverId);
    if (status)      reservations = reservations.filter((r) => r.status      === status);

    return NextResponse.json(reservations);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReservationRecord;

    if (!body.tripId || !body.passengerId) {
      return NextResponse.json(
        { error: 'tripId et passengerId sont requis' },
        { status: 400 }
      );
    }

    const passengerId = body.passengerId as string;

    // Limite : maximum 5 demandes simultanées par passager
    const existingPending = persistenceManager.readAll<ReservationRecord>('reservations')
      .filter((r) => r.passengerId === passengerId && r.status === 'pending');
    if (existingPending.length >= 5) {
      return NextResponse.json(
        { error: 'Maximum 5 demandes simultanées — annulez une demande avant d\'en créer une nouvelle' },
        { status: 429 }
      );
    }

    const trip = persistenceManager.readById<TripRecord>('trips', body.tripId as string);
    if (!trip) {
      return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 });
    }
    if ((trip.currentPassengers as number) >= (trip.maxPassengers as number)) {
      return NextResponse.json({ error: 'Plus de places disponibles' }, { status: 409 });
    }

    const year = new Date().getFullYear();
    const rand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
    const now  = new Date().toISOString();

    const newReservation: ReservationRecord = {
      ...body,
      id: `RSV-${year}-${rand}`,
      status: 'pending',
      driverId: trip.driverId,
      createdAt: now,
      updatedAt: now,
    };

    persistenceManager.addItem('reservations', newReservation);

    // Bloquer 6$ sur le compte bancaire du passager (retenue de sécurité)
    await paymentService.blockHoldingAmount(passengerId, newReservation.id as string);

    return NextResponse.json(newReservation, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
