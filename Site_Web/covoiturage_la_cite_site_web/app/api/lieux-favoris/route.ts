/**
 * GET /api/lieux-favoris?userId={id}
 *
 * Retourne les lieux favoris de l'utilisateur demandé,
 * triés par : ancré en premier, puis ordre de création.
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';
import type { LieuFavoriUnifie } from '@/shared/types/lieu-favori.types';

type LieuFavoriRecord = LieuFavoriUnifie & { userId: string };

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    const all = persistenceManager.readAll<LieuFavoriRecord>('lieux_favoris');

    // Filtre par utilisateur, ancré en premier
    const userFavoris = all
      .filter((f) => f.userId === userId)
      .sort((a, b) => {
        if (a.isAnchored && !b.isAnchored) return -1;
        if (!a.isAnchored && b.isAnchored) return 1;
        return 0;
      })
      .map(({ userId: _uid, ...rest }) => rest as LieuFavoriUnifie);

    return NextResponse.json(userFavoris);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as LieuFavoriRecord;
    if (!body.userId || !body.adresse) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 });
    }

    const all = persistenceManager.readAll<LieuFavoriRecord>('lieux_favoris');
    const newFav: LieuFavoriRecord = {
      ...body,
      id: body.id ?? `FAV-LOC-${Date.now()}`,
    };
    persistenceManager.writeAll('lieux_favoris', [...all, newFav]);

    return NextResponse.json(newFav, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json({ error: 'id et userId requis' }, { status: 400 });
    }

    const all = persistenceManager.readAll<LieuFavoriRecord>('lieux_favoris');
    // On ne supprime pas le favori ancré (Campus La Cité)
    const filtered = all.filter((f) => !(f.id === id && f.userId === userId && !f.isAnchored));
    persistenceManager.writeAll('lieux_favoris', filtered);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
