/**
 * POST /api/passenger/search
 * Délègue au Server Core — POST api/matching/search
 */
import { NextResponse } from 'next/server';
import { MatchingService } from '@/server/services/MatchingService';
import { withAuth } from '@/server/auth';

export async function POST(req: Request) {
  try {
    const auth = await withAuth(req);
    const body = await req.json();

    const result = await MatchingService.search(body, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[/api/passenger/search]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
