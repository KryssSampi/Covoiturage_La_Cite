import { NextResponse } from 'next/server';
import { cancelReservationWorkflow } from '@/core/services/reservation-lifecycle-api.service';

type Context = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;

    const callerId = req.headers.get('x-caller-id');
    if (!callerId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const body = (await req.json().catch(() => ({}))) as { raison?: string };

    const result = cancelReservationWorkflow(id, callerId, body.raison);
    if (!result.reservation) {
      return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });
    }

    return NextResponse.json({
      reservation: result.reservation,
      tripUpdated: result.tripUpdated,
    });
  } catch (error) {
    console.error('[cancel]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
