/**
 * GET /api/trajet-en-cours/[id]
 * Route thin — délègue toute la logique à buildTrajetEnCours.
 *
 * Retourne le payload complet pour la page « Trajet en cours » :
 * trajetData, mapFixture, moi, correspondants, conversations, reservations, etc.
 *
 * En-tête requis : X-Caller-Id (identifiant de l'utilisateur connecté)
 */
import { NextResponse } from 'next/server';
import { buildTrajetEnCours } from '@/core/services/trajet-en-cours.service';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: tripId } = await params;

    // Identification de l'utilisateur connecté
    const callerId = req.headers.get('x-caller-id');
    if (!callerId) {
      return NextResponse.json(
        { error: 'En-tête X-Caller-Id requis' },
        { status: 401 },
      );
    }

    const result = buildTrajetEnCours(tripId, callerId);
    if (!result) {
      return NextResponse.json(
        { error: 'Trajet introuvable ou données incomplètes' },
        { status: 404 },
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[trajet-en-cours/GET]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
