import { NextResponse } from 'next/server';
import { queryEnrichedReviews } from '@/core/services/review-api.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const revieweeId = searchParams.get('revieweeId');

    if (!revieweeId) {
      return NextResponse.json({ error: 'Le parametre revieweeId est requis' }, { status: 400 });
    }

    const reviews = queryEnrichedReviews(revieweeId);
    return NextResponse.json(reviews);
  } catch (error) {
    console.error('[api/reviews/enriched]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
