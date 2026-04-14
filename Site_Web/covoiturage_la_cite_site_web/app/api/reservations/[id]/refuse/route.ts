import { NextResponse } from 'next/server';
import { ReservationService } from '@/server/services/ReservationService';
import { withAuth } from '@/server/auth';

type Context = { params: Promise<{ id: string }> };

export async function POST(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = (await req.json().catch(() => ({}))) as { raison?: string };
    const auth = await withAuth(req);

    const result = await ReservationService.refuse(id, body.raison ? { reason: body.raison } : undefined, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[refuse]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
