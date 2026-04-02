/**
 * GET /api/passenger/historique
 * Délègue au Server Core — GET api/passenger/historique
 */
import { NextResponse } from 'next/server';
import { HistoriqueService } from '@/server/services/HistoriqueService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await HistoriqueService.getPassengerHistorique(undefined, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/passenger/historique]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
