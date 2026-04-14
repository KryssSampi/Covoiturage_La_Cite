import { NextResponse } from 'next/server';
import { buildFavorisResponse } from '@/core/services/favoris-api.service';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);

    if (!auth.token) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    return NextResponse.json(await buildFavorisResponse(auth));
  } catch (err) {
    console.error('[api/favoris]', err);
    console.error('[API] GET /api/favoris - erreur');
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
