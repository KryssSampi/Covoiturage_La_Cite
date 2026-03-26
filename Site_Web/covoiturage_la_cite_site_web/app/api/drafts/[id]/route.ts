import { NextResponse } from 'next/server';
import { deleteDraft, getDraftById, patchDraft, type DraftRecord } from '@/core/services/draft-api.service';

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const draft = getDraftById(id);
    if (!draft) return NextResponse.json({ error: 'Brouillon introuvable' }, { status: 404 });
    return NextResponse.json(draft);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const patch = (await req.json()) as DraftRecord;

    const existing = getDraftById(id);
    if (!existing) return NextResponse.json({ error: 'Brouillon introuvable' }, { status: 404 });

    return NextResponse.json(patchDraft(id, patch));
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const existing = getDraftById(id);
    if (!existing) return NextResponse.json({ error: 'Brouillon introuvable' }, { status: 404 });

    deleteDraft(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
