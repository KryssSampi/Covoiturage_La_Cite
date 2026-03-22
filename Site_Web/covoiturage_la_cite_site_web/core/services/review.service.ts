import { staticDb } from '@/tests/db/StaticDb';
import type { ReviewModel } from '@/core/models/ReviewModel';

/**
 * ReviewService — Service de gestion des évaluations
 */
export const ReviewService = {
  async getAll(): Promise<ReviewModel[]> {
    return staticDb.getAll('reviews');
  },

  async getForUser(userId: string): Promise<ReviewModel[]> {
    const all = await staticDb.getAll('reviews');
    return all.filter((r) => r.revieweeId === userId);
  },

  async getByTrip(tripId: string): Promise<ReviewModel[]> {
    const all = await staticDb.getAll('reviews');
    return all.filter((r) => r.tripId === tripId);
  },

  async create(review: ReviewModel): Promise<void> {
    await staticDb.add('reviews', review);
    staticDb.invalidate('reviews');
  },

  generateId(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `REV-${year}-${rand}`;
  },
};
