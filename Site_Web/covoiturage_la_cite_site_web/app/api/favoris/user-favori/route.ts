import { NextResponse } from 'next/server';
import { setUserFavori, unsetUserFavori } from '@/core/services/favoris-api.service';
import { withAuth } from '@/server/auth';

export async function POST(req: Request) {
  try {
    const auth = await withAuth(req);
    if (!auth.token) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const { targetUserId } = (await req.json()) as { targetUserId?: string };

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId requis' }, { status: 400 });
    }

    const affinite = await setUserFavori(targetUserId, auth);
    return NextResponse.json(affinite, { status: 200 });
  } catch (err) {
    console.error('[api/favoris/user-favori]', err);
    console.error('[API] POST /api/favoris/user-favori - erreur');
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await withAuth(req);
    if (!auth.token) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const affiniteId = searchParams.get('affiniteId');
    const targetUserId = searchParams.get('targetUserId');

    let payloadTargetUserId: string | undefined;
    if (!targetUserId) {
      try {
        const body = (await req.json()) as { targetUserId?: string };
        payloadTargetUserId = body.targetUserId;
      } catch {
        payloadTargetUserId = undefined;
      }
    }

    if (!affiniteId && !targetUserId && !payloadTargetUserId) {
      return NextResponse.json({ error: 'affiniteId ou targetUserId requis' }, { status: 400 });
    }

    const updated = await unsetUserFavori(
      affiniteId ?? '',
      auth,
      targetUserId ?? payloadTargetUserId,
    );

    if (!updated) {
      return NextResponse.json({ error: 'Affinite introuvable' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[api/favoris/user-favori]', err);
    console.error('[API] DELETE /api/favoris/user-favori - erreur');
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
