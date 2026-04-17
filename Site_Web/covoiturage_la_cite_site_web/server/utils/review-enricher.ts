import type { Review as DashboardReview } from '@/features/dashboard/types';
import { UserService, type UserPublicDto } from '@/server/services/UserService';
import { withAuth } from '@/server/auth';

export type EnrichedReviewCandidate = {
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

export function buildReviewerName(review: EnrichedReviewCandidate, profile?: UserPublicDto): string {
  const fromReviewerName = review.reviewerName?.trim();
  if (fromReviewerName) return fromReviewerName;

  const fromNameParts = `${review.reviewerFirstName ?? ''} ${review.reviewerLastName ?? ''}`.trim();
  if (fromNameParts) return fromNameParts;

  if (profile) return `${profile.firstName} ${profile.lastName}`.trim();
  return 'Membre La Cite';
}

export function toDashboardReview(
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

export async function fetchReviewerProfiles(
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
