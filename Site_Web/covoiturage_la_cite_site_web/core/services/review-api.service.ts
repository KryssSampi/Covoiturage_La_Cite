import type { ReviewModel } from '@/core/models/ReviewModel';
import type { UserModel } from '@/core/models/UserModel';
import { generatePrefixedId, nowIso, sortByDateDesc } from '@/core/utils/api-route.utils';
import { reviewModelToReview } from '@/features/dashboard/converters/dashboard.converter';
import { persistenceManager } from '@/tests/PersistenceManager';

export interface ReviewQueryFilters {
  revieweeId?: string | null;
  reviewerId?: string | null;
  tripId?: string | null;
}

export function queryReviews(filters: ReviewQueryFilters): ReviewModel[] {
  let reviews = persistenceManager.readAll<ReviewModel>('reviews');

  if (filters.revieweeId) {
    reviews = reviews.filter((review) => review.revieweeId === filters.revieweeId);
  }
  if (filters.reviewerId) {
    reviews = reviews.filter((review) => review.reviewerId === filters.reviewerId);
  }
  if (filters.tripId) {
    reviews = reviews.filter((review) => review.tripId === filters.tripId);
  }

  return reviews;
}

export function buildReviewRecord(payload: Partial<ReviewModel>): { review?: ReviewModel; error?: string; status?: number } {
  if (!payload.tripId || !payload.reviewerId || !payload.revieweeId || payload.rating === undefined) {
    return {
      error: 'tripId, reviewerId, revieweeId et rating sont requis',
      status: 400,
    };
  }

  if (payload.rating < 1 || payload.rating > 5) {
    return { error: 'La note doit etre entre 1 et 5', status: 400 };
  }

  return {
    review: {
      ...(payload as ReviewModel),
      id: payload.id ?? generatePrefixedId('REV'),
      tags: payload.tags ?? [],
      createdAt: payload.createdAt ?? nowIso(),
    },
  };
}

export function queryEnrichedReviews(revieweeId: string) {
  const allReviews = persistenceManager.readAll<ReviewModel>('reviews');
  const allUsers = persistenceManager.readAll<UserModel>('users');
  const usersMap = new Map(allUsers.map((user) => [user.id, user]));

  return sortByDateDesc(
    allReviews.filter((review) => review.revieweeId === revieweeId),
    (review) => review.createdAt,
  ).map((review) => reviewModelToReview(review, usersMap.get(review.reviewerId)));
}
