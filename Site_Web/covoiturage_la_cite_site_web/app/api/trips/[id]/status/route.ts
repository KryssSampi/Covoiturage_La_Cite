import { NextResponse } from 'next/server';
import { TripService } from '@/server/services/TripService';
import { withAuth } from '@/server/auth';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const { action } = (await req.json()) as { action: string };
    const auth = await withAuth(req);

    const actionMap: Record<string, (tripId: string, opts?: Record<string, unknown>) => Promise<unknown>> = {
      start: (tripId, opts) => TripService.start(tripId, opts),
      complete: (tripId, opts) => TripService.complete(tripId, opts),
      cancel: (tripId, opts) => TripService.cancel(tripId, undefined, opts),
      publish: (tripId, opts) => TripService.publish(tripId, opts),
    };

    const handler = actionMap[action];
    if (!handler) {
      return NextResponse.json({ error: 'Action invalide (start|complete|cancel|publish)' }, { status: 400 });
    }

    const result = await handler(id, auth);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
