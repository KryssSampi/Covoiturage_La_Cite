/**
 * GET  /api/reservations — Liste filtrée
 * POST /api/reservations — Création d'une réservation
 */

import { NextResponse } from 'next/server';
import { ReservationService } from '@/server/services/ReservationService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await ReservationService.getMine(undefined, 1, 100, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data?.items ?? []);
  } catch (err) {
    console.error('[api/reservations]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      tripId?: string;
      seatsRequested?: number;
      pickupNote?: string;
    };
    const auth = await withAuth(req);
    const payload = {
      tripId: String(body.tripId ?? ''),
      seatsRequested:
        typeof body.seatsRequested === 'number' && Number.isFinite(body.seatsRequested)
          ? Math.max(1, Math.trunc(body.seatsRequested))
          : 1,
      pickupNote: typeof body.pickupNote === 'string' ? body.pickupNote : undefined,
    };

    if (!payload.tripId) {
      return NextResponse.json({ error: 'tripId requis' }, { status: 400 });
    }

    const result = await ReservationService.create(payload, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message ?? 'Erreur serveur' }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (err) {
    console.error('[api/reservations]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
