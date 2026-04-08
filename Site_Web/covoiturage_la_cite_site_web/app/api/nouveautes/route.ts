import { NextResponse } from 'next/server';
import { ContentService } from '@/server/services/ContentService';
import { withAuth } from '@/server/auth';

/**
 * GET  /api/nouveautes — Nouveautés publiées depuis Server Core (MongoDB).
 * POST /api/nouveautes — Créer une nouveauté (admin).
 */
export async function GET() {
  try {
    const result = await ContentService.getNouveautes();
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json(result.data ?? []);
  } catch (err) {
    console.error('[api/nouveautes GET]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await withAuth(req);
    const body = await req.json();
    const result = await ContentService.createNouveaute(body, auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json(result.data, { status: 201 });
  } catch (err) {
    console.error('[api/nouveautes POST]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
