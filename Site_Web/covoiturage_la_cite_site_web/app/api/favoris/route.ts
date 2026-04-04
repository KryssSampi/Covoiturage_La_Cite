import { NextResponse } from 'next/server';
import { buildFavorisResponse } from '@/core/services/favoris-api.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    return NextResponse.json(buildFavorisResponse(userId));
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
