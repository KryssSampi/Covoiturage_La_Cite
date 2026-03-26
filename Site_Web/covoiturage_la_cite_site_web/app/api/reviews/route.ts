import { NextResponse } from 'next/server';
import type { ReviewModel } from '@/core/models/ReviewModel';
import { buildReviewRecord, queryReviews } from '@/core/services/review-api.service';
import { persistenceManager } from '@/tests/PersistenceManager';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const revieweeId = searchParams.get('revieweeId');
    const reviewerId = searchParams.get('reviewerId');
    const tripId = searchParams.get('tripId');

    return NextResponse.json(queryReviews({ revieweeId, reviewerId, tripId }));
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Partial<ReviewModel>;
    const { review, error, status } = buildReviewRecord(body);

    if (!review) {
      return NextResponse.json({ error }, { status: status ?? 400 });
    }

    persistenceManager.addItem('reviews', review);
    return NextResponse.json(review, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
