/**
 * GET /api/sse/db-watch/[entity]
 *
 * ── DÉSACTIVÉ ──────────────────────────────────────────────────────────────
 * L'ancien système SSE basé sur PersistenceManager (fs.watch JSON) est
 * désactivé. Toutes les données passent désormais par le Server Core.
 *
 * Retourne un JSON 503 pour que les EventSource côté client échouent
 * proprement sans tentative de reconnexion (non text/event-stream).
 * ────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { error: 'SSE db-watch désactivé — utiliser Server Core' },
    { status: 503 },
  );
}
