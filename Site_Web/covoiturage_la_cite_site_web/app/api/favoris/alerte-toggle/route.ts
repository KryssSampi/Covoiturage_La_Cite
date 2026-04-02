import { NextResponse } from 'next/server';
import { FavoriteService } from '@/server/services/SocialService';
import { withAuth } from '@/server/auth';

export async function PATCH(req: Request) {
  try {
    const { targetUserId } = (await req.json()) as { targetUserId?: string };

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId requis' }, { status: 400 });
    }

    const auth = await withAuth(req);
    const result = await FavoriteService.toggle(targetUserId, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get('targetUserId');

    if (!targetUserId) {
      return NextResponse.json({ error: 'targetUserId requis' }, { status: 400 });
    }

    const auth = await withAuth(req);
    const result = await FavoriteService.unblock(targetUserId, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
