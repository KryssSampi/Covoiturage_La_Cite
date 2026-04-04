/**
 * GET /api/sse/notifications?userId=X
 *
 * ── DÉSACTIVÉ ──────────────────────────────────────────────────────────────
 * L'ancien système SSE basé sur PersistenceManager (fs.watch JSON) est
 * désactivé. Les notifications sont récupérées via GET /api/notifications.
 *
 * Retourne un JSON 503 pour que les EventSource échouent proprement.
 * ────────────────────────────────────────────────────────────────────────────
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(
    { error: 'SSE notifications désactivé — utiliser GET /api/notifications' },
    { status: 503 },
  );
}
