import { NextResponse } from 'next/server';
import type { Review as DashboardReview } from '@/features/dashboard/types';
import { withAuth } from '@/server/auth';
import { ReviewService } from '@/server/services/SocialService';
import { UserService, type UserPublicDto } from '@/server/services/UserService';

type EnrichedReviewCandidate = {
  id: string;
  reviewerId: string;
  revieweeId?: string;
  rating: number;
  comment?: string;
  tags?: string[];
  tripId?: string | null;
  reservationId?: string | null;
  createdAt: string;
  reviewerName?: string;
  reviewerFirstName?: string;
  reviewerLastName?: string;
  reviewerAvatarUrl?: string;
  reviewerpicture?: string;
};

function sortByCreatedAtDesc(a: { createdAt: string }, b: { createdAt: string }): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function buildReviewerName(review: EnrichedReviewCandidate, profile?: UserPublicDto): string {
  const fromReviewerName = review.reviewerName?.trim();
  if (fromReviewerName) return fromReviewerName;

  const fromNameParts = `${review.reviewerFirstName ?? ''} ${review.reviewerLastName ?? ''}`.trim();
  if (fromNameParts) return fromNameParts;

  if (profile) return `${profile.firstName} ${profile.lastName}`.trim();
  return 'Membre La Cite';
}

function toDashboardReview(
  review: EnrichedReviewCandidate,
  fallbackRevieweeId: string,
  reviewerProfile?: UserPublicDto,
): DashboardReview {
  return {
    id: review.id,
    reviewer: buildReviewerName(review, reviewerProfile),
    reviewerId: review.reviewerId,
    revieweeId: review.revieweeId ?? fallbackRevieweeId,
    reviewerpicture: review.reviewerAvatarUrl ?? review.reviewerpicture ?? reviewerProfile?.avatarUrl ?? '',
    rating: review.rating,
    date: review.createdAt.slice(0, 10),
    comment: review.comment ?? '',
    tags: Array.isArray(review.tags) ? review.tags : [],
    tripId: review.tripId ?? null,
    createdAt: review.createdAt,
  };
}

async function fetchReviewerProfiles(
  reviewerIds: string[],
  auth: Awaited<ReturnType<typeof withAuth>>,
): Promise<Map<string, UserPublicDto>> {
  const uniqueIds = [...new Set(reviewerIds.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map();

  const results = await Promise.allSettled(
    uniqueIds.map(async (reviewerId) => {
      const response = await UserService.getPublicProfile(reviewerId, auth);
      if (!response.success || !response.data) return null;
      return [reviewerId, response.data] as const;
    }),
  );

  const entries = results
    .filter((result): result is PromiseFulfilledResult<readonly [string, UserPublicDto] | null> => result.status === 'fulfilled')
    .map((result) => result.value)
    .filter((value): value is readonly [string, UserPublicDto] => value !== null);

  return new Map(entries);
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
