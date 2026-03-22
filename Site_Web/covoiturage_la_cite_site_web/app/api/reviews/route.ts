/**
 * GET  /api/reviews   — Liste des avis (filtrée par revieweeId ou reviewerId)
 * POST /api/reviews   — Création d'un avis
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

type ReviewRecord = Record<string, unknown>;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const revieweeId = searchParams.get('revieweeId');
    const reviewerId = searchParams.get('reviewerId');
    const tripId     = searchParams.get('tripId');

    let reviews = persistenceManager.readAll<ReviewRecord>('reviews');

    if (revieweeId) reviews = reviews.filter((r) => r.revieweeId === revieweeId);
    if (reviewerId) reviews = reviews.filter((r) => r.reviewerId === reviewerId);
    if (tripId)     reviews = reviews.filter((r) => r.tripId     === tripId);

    return NextResponse.json(reviews);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReviewRecord;

    if (!body.tripId || !body.reviewerId || !body.revieweeId || body.rating === undefined) {
      return NextResponse.json(
        { error: 'tripId, reviewerId, revieweeId et rating sont requis' },
        { status: 400 }
      );
    }
    if ((body.rating as number) < 1 || (body.rating as number) > 5) {
      return NextResponse.json({ error: 'La note doit être entre 1 et 5' }, { status: 400 });
    }

    const year = new Date().getFullYear();
    const rand = String(Math.floor(10000 + Math.random() * 90000)).padStart(5, '0');
    const now  = new Date().toISOString();

    const newReview: ReviewRecord = {
      ...body,
      id: `REV-${year}-${rand}`,
      tags: body.tags ?? [],
      createdAt: now,
    };

    persistenceManager.addItem('reviews', newReview);
    return NextResponse.json(newReview, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
