/**
 * GET    /api/trips/[id]   — Détail d'un trajet
 * PATCH  /api/trips/[id]   — Mise à jour partielle d'un trajet
 * DELETE /api/trips/[id]   — Suppression d'un trajet
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const trip = persistenceManager.readById<Record<string, unknown>>('trips', id);
    if (!trip) return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 });
    return NextResponse.json(trip);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const patch = (await req.json()) as Record<string, unknown>;

    const existing = persistenceManager.readById<Record<string, unknown>>('trips', id);
    if (!existing) return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 });

    const updated = persistenceManager.updateItem<Record<string, unknown>>('trips', id, patch);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const existing = persistenceManager.readById<Record<string, unknown>>('trips', id);
    if (!existing) return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 });

    persistenceManager.deleteItem('trips', id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
