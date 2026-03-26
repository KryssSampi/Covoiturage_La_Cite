/**
 * GET /api/driver/historique?driverId=XXX
 * Route thin — délègue à buildDriverHistorique.
 */
import { NextResponse } from 'next/server';
import { buildDriverHistorique } from '@/core/services/historique.service';

export async function GET(req: Request) {
  try {
    const driverId = new URL(req.url).searchParams.get('driverId');
    if (!driverId) {
      return NextResponse.json({ error: 'Le paramètre driverId est requis' }, { status: 400 });
    }

    return NextResponse.json(buildDriverHistorique(driverId));
  } catch (err) {
    console.error('[api/driver/historique]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
