/**
 * GET  /api/drafts   — Liste des brouillons d'un conducteur
 * POST /api/drafts   — Création ou sauvegarde d'un brouillon
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

type DraftRecord = Record<string, unknown>;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get('driverId');

    let drafts = persistenceManager.readAll<DraftRecord>('drafts');
    if (driverId) drafts = drafts.filter((d) => d.driverId === driverId);

    // Tri antéchronologique sur updatedAt
    drafts.sort(
      (a, b) =>
        new Date(b.updatedAt as string).getTime() -
        new Date(a.updatedAt as string).getTime()
    );

    return NextResponse.json(drafts);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DraftRecord;

    if (!body.driverId) {
      return NextResponse.json({ error: 'driverId est requis' }, { status: 400 });
    }

    // Si le brouillon a déjà un ID → mise à jour
    if (body.id) {
      const existing = persistenceManager.readById<DraftRecord>('drafts', body.id as string);
      if (existing) {
        const updated = persistenceManager.updateItem<DraftRecord>('drafts', body.id as string, body);
        return NextResponse.json(updated);
      }
    }

    // Sinon → création
    const year = new Date().getFullYear();
    const rand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
    const now  = new Date().toISOString();

    const newDraft: DraftRecord = {
      ...body,
      id: body.id ?? `DRF-${year}-${rand}`,
      createdAt: now,
      updatedAt: now,
    };

    persistenceManager.addItem('drafts', newDraft);
    return NextResponse.json(newDraft, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
