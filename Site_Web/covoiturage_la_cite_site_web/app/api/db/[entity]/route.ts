import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';
import type { AllowedEntity } from '@/tests/PersistenceManager';

/** GET /api/db/:entity — Lecture complète */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;

  if (!persistenceManager.isAllowed(entity)) {
    return NextResponse.json({ error: 'Entité non autorisée' }, { status: 400 });
  }

  try {
    const data = persistenceManager.readAll(entity as AllowedEntity);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Lecture impossible' }, { status: 500 });
  }
}

/** PUT /api/db/:entity — Remplacement complet */
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;

  if (!persistenceManager.isAllowed(entity)) {
    return NextResponse.json({ error: 'Entité non autorisée' }, { status: 400 });
  }

  try {
    const data = (await req.json()) as unknown[];
    persistenceManager.writeAll(entity as AllowedEntity, data);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Écriture impossible' }, { status: 500 });
  }
}

/** POST /api/db/:entity — Ajout d'un élément */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;

  if (!persistenceManager.isAllowed(entity)) {
    return NextResponse.json({ error: 'Entité non autorisée' }, { status: 400 });
  }

  try {
    const newItem = await req.json();
    persistenceManager.addItem(entity as AllowedEntity, newItem);
    return NextResponse.json(newItem, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Ajout impossible' }, { status: 500 });
  }
}
