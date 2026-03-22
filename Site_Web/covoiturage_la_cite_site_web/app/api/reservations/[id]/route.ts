/**
 * GET   /api/reservations/[id]   — Détail d'une réservation
 * PATCH /api/reservations/[id]   — Mise à jour partielle d'une réservation
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

type Context = { params: Promise<{ id: string }> };
type ReservationRecord = Record<string, unknown>;

export async function GET(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const reservation = persistenceManager.readById<ReservationRecord>('reservations', id);
    if (!reservation) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }
    return NextResponse.json(reservation);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const patch = (await req.json()) as ReservationRecord;

    const existing = persistenceManager.readById<ReservationRecord>('reservations', id);
    if (!existing) {
      return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
    }

    const updated = persistenceManager.updateItem<ReservationRecord>('reservations', id, patch);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
