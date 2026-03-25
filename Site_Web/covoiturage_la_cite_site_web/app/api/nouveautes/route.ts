/**
 * GET  /api/nouveautes — Liste des vidéos de nouveautés
 * POST /api/nouveautes — Ajout d'une vidéo de nouveauté
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

type NouveauteRecord = Record<string, unknown>;

export async function GET() {
  try {
    const items = persistenceManager.readAll<NouveauteRecord>('nouveautes');

    // Tri antéchronologique par date de création
    items.sort(
      (a, b) =>
        new Date(b.createdAt as string).getTime() -
        new Date(a.createdAt as string).getTime(),
    );

    return NextResponse.json(items);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as NouveauteRecord;

    if (!body.title || !body.videoUrl) {
      return NextResponse.json(
        { error: 'title et videoUrl sont requis' },
        { status: 400 },
      );
    }

    const year = new Date().getFullYear();
    const rand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
    const now  = new Date().toISOString();

    const item: NouveauteRecord = {
      ...body,
      id: `NVT-${year}-${rand}`,
      createdAt: now,
    };

    persistenceManager.addItem('nouveautes', item);
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
