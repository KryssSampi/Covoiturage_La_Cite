/**
 * GET /api/driver/historique
 * Délègue au Server Core — GET api/driver/historique
 */
import { NextResponse } from 'next/server';
import { HistoriqueService } from '@/server/services/HistoriqueService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await HistoriqueService.getDriverHistorique(undefined, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    const raw = result.data as unknown;
    const entries = Array.isArray(raw) ? raw : ((raw as { items?: unknown[] } | null)?.items ?? []);
    return NextResponse.json(entries);
  } catch (err) {
    console.error('[api/driver/historique]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
