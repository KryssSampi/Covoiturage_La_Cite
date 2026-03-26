import { NextResponse } from 'next/server';
import { setUserFavori, unsetUserFavori } from '@/core/services/favoris-api.service';

export async function POST(req: Request) {
  try {
    const { userId, targetUserId } = (await req.json()) as {
      userId?: string;
      targetUserId?: string;
    };

    if (!userId || !targetUserId) {
      return NextResponse.json({ error: 'userId et targetUserId requis' }, { status: 400 });
    }

    const { affinite, created } = setUserFavori(userId, targetUserId);
    return NextResponse.json(affinite, { status: created ? 201 : 200 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const affiniteId = searchParams.get('affiniteId');

    if (!affiniteId) {
      return NextResponse.json({ error: 'affiniteId requis' }, { status: 400 });
    }

    const updated = unsetUserFavori(affiniteId);
    if (!updated) {
      return NextResponse.json({ error: 'Affinite non trouvee' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
