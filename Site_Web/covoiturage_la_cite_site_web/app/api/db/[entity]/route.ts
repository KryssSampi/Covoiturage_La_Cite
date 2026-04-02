import { NextResponse } from 'next/server';

// ── SELF-SERVICE DÉSACTIVÉ ─────────────────────────────────────────────────────
// Route générique JSON locale désactivée — toutes les données passent maintenant
// par le Server Core via server/services/*.
// Conserver ce fichier commenté pour référence.
//
// import { persistenceManager } from '@/tests/PersistenceManager';
// import type { AllowedEntity } from '@/tests/PersistenceManager';
//
// export async function GET(_req: Request, { params }) {
//   const { entity } = await params;
//   if (!persistenceManager.isAllowed(entity)) return NextResponse.json({ error: 'Entité non autorisée' }, { status: 400 });
//   const data = persistenceManager.readAll(entity as AllowedEntity);
//   return NextResponse.json(data);
// }
// export async function PUT(req: Request, { params }) { ... }
// export async function POST(req: Request, { params }) { ... }

export async function GET() {
  return NextResponse.json({ error: 'Self-service désactivé — utiliser Server Core' }, { status: 503 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Self-service désactivé — utiliser Server Core' }, { status: 503 });
}

export async function POST() {
  return NextResponse.json({ error: 'Self-service désactivé — utiliser Server Core' }, { status: 503 });
}
