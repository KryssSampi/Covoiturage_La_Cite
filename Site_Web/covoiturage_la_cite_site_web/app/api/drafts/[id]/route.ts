/**
 * GET    /api/drafts/[id]    — Détail d'un brouillon
 * PATCH  /api/drafts/[id]    — Mise à jour partielle d'un brouillon
 * DELETE /api/drafts/[id]    — Suppression d'un brouillon
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

type Context = { params: Promise<{ id: string }> };
type DraftRecord = Record<string, unknown>;

export async function GET(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const draft = persistenceManager.readById<DraftRecord>('drafts', id);
    if (!draft) return NextResponse.json({ error: 'Brouillon introuvable' }, { status: 404 });
    return NextResponse.json(draft);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const patch  = (await req.json()) as DraftRecord;

    const existing = persistenceManager.readById<DraftRecord>('drafts', id);
    if (!existing) return NextResponse.json({ error: 'Brouillon introuvable' }, { status: 404 });

    const updated = persistenceManager.updateItem<DraftRecord>('drafts', id, patch);
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const { id } = await params;

    const existing = persistenceManager.readById<DraftRecord>('drafts', id);
    if (!existing) return NextResponse.json({ error: 'Brouillon introuvable' }, { status: 404 });

    persistenceManager.deleteItem('drafts', id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
