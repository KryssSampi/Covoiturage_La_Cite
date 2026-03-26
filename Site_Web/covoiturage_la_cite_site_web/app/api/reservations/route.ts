/**
 * GET  /api/reservations — Liste filtrée
 * POST /api/reservations — Création d'une réservation
 */

import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';
import { paymentService } from '@/server/services/PaymentService';
import { buildPendingReservationRecord, filterReservationsForQuery, type ReservationRecord } from '@/core/services/reservation-api.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const reservations = filterReservationsForQuery({
      passengerId: searchParams.get('passengerId'),
      driverId: searchParams.get('driverId'),
      status: searchParams.get('status'),
    });

    return NextResponse.json(reservations);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReservationRecord;
    const result = buildPendingReservationRecord(body);

    if (!result.reservation) {
      return NextResponse.json({ error: result.error ?? 'Erreur serveur' }, { status: result.status ?? 500 });
    }

    persistenceManager.addItem('reservations', result.reservation);
    await paymentService.blockHoldingAmount(body.passengerId as string, result.reservation.id as string);

    return NextResponse.json(result.reservation, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
