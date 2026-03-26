/**
 * GET /api/passenger/historique?passengerId=XXX
 * Route thin — délègue à buildPassengerHistorique.
 */
import { NextResponse } from 'next/server';
import { buildPassengerHistorique } from '@/core/services/historique.service';

export async function GET(req: Request) {
  try {
    const passengerId = new URL(req.url).searchParams.get('passengerId');
    if (!passengerId) {
      return NextResponse.json({ error: 'Le paramètre passengerId est requis' }, { status: 400 });
    }

    return NextResponse.json(buildPassengerHistorique(passengerId));
  } catch (err) {
    console.error('[api/passenger/historique]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
