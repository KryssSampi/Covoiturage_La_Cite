import { NextResponse } from 'next/server';
import {
  applyTripStatusAction,
  getTripById,
  resolveTripStatusAction,
} from '@/core/services/trip-lifecycle-api.service';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const { action } = (await req.json()) as { action: string };

    if (!resolveTripStatusAction(action)) {
      return NextResponse.json({ error: 'Action invalide (start|complete|cancel)' }, { status: 400 });
    }

    const existingTrip = getTripById(id);
    if (!existingTrip) {
      return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 });
    }

    return NextResponse.json(applyTripStatusAction(id, action));
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
