/**
 * POST /api/reservations/[id]/accept
 *
 * La route conserve l'orchestration HTTP.
 * Le workflow d'acceptation est déplacé dans le core.
 */

import { NextResponse } from 'next/server';
import { acceptReservationWorkflow } from '@/core/services/reservation-acceptance.service';

type Context = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;

    // Le conducteur doit s'identifier via le header X-Caller-Id.
    const callerId = req.headers.get('x-caller-id');
    if (!callerId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const result = acceptReservationWorkflow(id, callerId);

    if (!result.reservation) {
      return NextResponse.json({ error: result.error ?? 'Erreur serveur' }, { status: result.status ?? 500 });
    }

    return NextResponse.json({
      reservation: result.reservation,
      prixAffiche: result.prixAffiche,
      autresDemandesAnnulees: result.autresDemandesAnnulees,
    });
  } catch (err) {
    console.error('[accept]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
