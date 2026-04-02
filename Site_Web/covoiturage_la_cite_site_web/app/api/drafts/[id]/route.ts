/**
 * GET    /api/drafts/[id] — Détail d'un brouillon
 * PATCH  /api/drafts/[id] — Modifier un brouillon
 * DELETE /api/drafts/[id] — Supprimer un brouillon
 * Délègue au Server Core
 */
import { NextResponse } from 'next/server';
import { DraftService } from '@/server/services/DraftService';
import { TripService } from '@/server/services/TripService';
import { withAuth } from '@/server/auth';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const auth = await withAuth(req);
    const result = await DraftService.getDraftById(id, auth);

    if (!result.success) {
      return NextResponse.json({ error: 'Brouillon introuvable' }, { status: 404 });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const auth = await withAuth(req);
    const body = await req.json();

    const result = await TripService.saveDraft(id, body, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
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
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
