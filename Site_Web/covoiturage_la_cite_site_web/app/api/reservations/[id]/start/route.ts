import { NextResponse } from 'next/server';
import { startReservationWorkflow } from '@/core/services/reservation-lifecycle-api.service';

type Context = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;

    const callerId = req.headers.get('x-caller-id');
    if (!callerId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const result = startReservationWorkflow(id, callerId);

    if (!result.reservation) {
      return NextResponse.json({ error: result.error }, { status: result.status ?? 400 });
    }

    return NextResponse.json({
      reservation: result.reservation,
      tripId: result.tripId,
    });
  } catch (error) {
    console.error('[start]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
