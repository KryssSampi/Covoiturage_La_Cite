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
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const auth = await withAuth(req);

    const result = await ReservationService.create(body, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message ?? 'Erreur serveur' }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
