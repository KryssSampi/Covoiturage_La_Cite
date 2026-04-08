/**
 * GET /api/trips/recommended
 *
 * Retourne jusqu'à 5 trajets recommandés pour l'utilisateur connecté.
 * Délègue à Server Core GET /api/trips/recommended.
 *
 * Algorithme Server Core :
 *  1. Analyse les destinations récentes du passager + conducteur (30 derniers jours)
 *  2. Cherche des trajets publiés vers la destination la plus fréquente
 *  3. Fallback : 5 trajets publiés aléatoires si pas d'historique
 */

import { NextResponse } from 'next/server';
import { TripService } from '@/server/services/TripService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await TripService.getRecommended(auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json(result.data ?? []);
  } catch (err) {
    console.error('[api/trips/recommended]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
