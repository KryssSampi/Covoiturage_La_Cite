
import { NextResponse } from 'next/server';
import { withAuth } from '@/server/auth';
import { ReviewService } from '@/server/services/SocialService';
import { fetchReviewerProfiles, toDashboardReview, type EnrichedReviewCandidate } from '@/server/utils/review-enricher';

function sortByCreatedAtDesc(a: { createdAt: string }, b: { createdAt: string }): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const revieweeId = searchParams.get('revieweeId');

    if (!revieweeId) {
      return NextResponse.json({ error: 'Le parametre revieweeId est requis' }, { status: 400 });
    }

    const auth = await withAuth(req);
    const result = await ReviewService.getReceived(auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message ?? 'Impossible de charger les avis' }, { status: 500 });
    }

    const receivedReviews = (result.data ?? []) as EnrichedReviewCandidate[];
    const filteredReviews = receivedReviews.filter((review) => !review.revieweeId || review.revieweeId === revieweeId);
    const reviewerProfiles = await fetchReviewerProfiles(
      filteredReviews.map((review) => review.reviewerId),
      auth,
    );

    const payload = filteredReviews
      .sort(sortByCreatedAtDesc)
      .map((review) => toDashboardReview(review, revieweeId, reviewerProfiles.get(review.reviewerId)));

    return NextResponse.json(payload);
  } catch (error) {
    console.error('[api/reviews/enriched]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
