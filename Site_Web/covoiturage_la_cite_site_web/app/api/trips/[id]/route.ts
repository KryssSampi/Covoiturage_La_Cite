import { NextResponse } from 'next/server';
import { TripService } from '@/server/services/TripService';
import { withAuth } from '@/server/auth';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const auth = await withAuth(req);

    const result = await TripService.getById(id, auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message ?? 'Trajet introuvable' }, { status: 404 });
    }
    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = await req.json();
    const auth = await withAuth(req);

    const result = await TripService.update(id, body, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message ?? 'Mise à jour échouée' }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const auth = await withAuth(req);

    const result = await TripService.cancel(id, undefined, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message ?? 'Annulation échouée' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
