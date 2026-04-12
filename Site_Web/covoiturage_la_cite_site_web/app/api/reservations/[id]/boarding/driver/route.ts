import { NextResponse } from 'next/server';
import { ReservationService } from '@/server/services/ReservationService';
import { withAuth } from '@/server/auth';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const auth = await withAuth(req);

    const result = await ReservationService.boardingDriver(id, auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message ?? 'Erreur serveur' }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[boarding/driver]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
