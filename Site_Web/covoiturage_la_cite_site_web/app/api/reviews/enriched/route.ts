import { NextResponse } from 'next/server';
import { ReviewService } from '@/server/services/SocialService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const revieweeId = searchParams.get('revieweeId');

    if (!revieweeId) {
      return NextResponse.json({ error: 'Le parametre revieweeId est requis' }, { status: 400 });
    }

    const auth = await withAuth(req);
    const result = await ReviewService.getAverage(revieweeId, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('[api/reviews/enriched]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
