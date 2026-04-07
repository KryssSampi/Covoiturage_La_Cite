import { NextResponse } from 'next/server';
import {
  deleteLieuFavori,
  queryLieuxFavoris,
  saveLieuFavori,
  type LieuFavoriRecord,
} from '@/core/services/lieux-favoris-api.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    return NextResponse.json(queryLieuxFavoris(userId));
  } catch {
    console.error('[API] GET /api/lieux-favoris — erreur');
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as LieuFavoriRecord;
    if (!body.userId || !body.adresse) {
      return NextResponse.json({ error: 'Donnees incompletes' }, { status: 400 });
    }

    return NextResponse.json(saveLieuFavori(body), { status: 201 });
  } catch {
    console.error('[API] POST /api/lieux-favoris — erreur');
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

    deleteLieuFavori(id, userId);
    return NextResponse.json({ success: true });
  } catch {
    console.error('[API] DELETE /api/lieux-favoris — erreur');
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
