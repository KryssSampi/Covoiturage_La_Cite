import { NextResponse } from 'next/server';
import { TripService } from '@/server/services/TripService';
import { withAuth } from '@/server/auth';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const auth = await withAuth(req);

    const result = await TripService.complete(id, auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message ?? 'Completion echouee' }, { status: 400 });
    }

    return NextResponse.json(result.data ?? { success: true });
  } catch (err) {
    console.error('[api/trips/[id]/complete]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
