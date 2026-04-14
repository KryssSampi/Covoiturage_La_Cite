import { NextResponse } from 'next/server';
import {
  deleteLieuFavori,
  queryLieuxFavoris,
  saveLieuFavori,
  type LieuFavoriRecord,
} from '@/core/services/lieux-favoris-api.service';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    if (!auth.token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const places = await queryLieuxFavoris('', { token: auth.token });
    return NextResponse.json(places);
  } catch (err) {
    console.error('[API] GET /api/lieux-favoris — erreur :', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await withAuth(req);
    if (!auth.token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = (await req.json()) as LieuFavoriRecord;
    if (!body.pseudonyme || !body.adresse) {
      return NextResponse.json({ error: 'Données incomplètes' }, { status: 400 });
    }

    const saved = await saveLieuFavori(body, { token: auth.token });
    return NextResponse.json(saved, { status: 201 });
  } catch (err) {
    console.error('[API] POST /api/lieux-favoris — erreur :', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await withAuth(req);
    if (!auth.token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    await deleteLieuFavori(id, '', { token: auth.token });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[API] DELETE /api/lieux-favoris — erreur :', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
