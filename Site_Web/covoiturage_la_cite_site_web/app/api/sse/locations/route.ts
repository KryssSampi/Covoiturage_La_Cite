import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ── DÉSACTIVÉ ──────────────────────────────────────────────────────────────
// L'ancien système de positions temps réel basé sur PersistenceManager
// (polling 2 s des fichiers JSON) est désactivé.
// ────────────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get('tripId');

  if (!tripId) {
    return NextResponse.json({ error: 'tripId requis' }, { status: 400 });
  }

  return NextResponse.json(
    { error: 'SSE locations désactivé — utiliser Server Core' },
    { status: 503 },
  );
}
