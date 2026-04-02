/**
 * GET   /api/reservations/[id]   — Détail d'une réservation
 * PATCH /api/reservations/[id]   — Mise à jour partielle d'une réservation
 */
import { NextResponse } from 'next/server';
import { ReservationService } from '@/server/services/ReservationService';
import { withAuth } from '@/server/auth';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const auth = await withAuth(req);

    const result = await ReservationService.getById(id, auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message ?? 'Réservation introuvable' }, { status: 404 });
    }
    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
