/**
 * @file stats.fixtures.ts
 * @description Données de test pour StatisticSection.
 * ⚠️ DÉVELOPPEMENT UNIQUEMENT — À remplacer par un appel API.
 *
 * TODO: GET /api/users/{userId}/stats/summary
 *   → { tripsCount, co2SavedKg, averageRating, goScore }
 */

import { UserStatsSummary } from "@/features/dashboard/types/review.types";

export const FIXTURE_USER_STATS: UserStatsSummary = {
  tripsCount: 32,
  co2SavedKg: 234.5,
  averageRating: 4.2,
  goScore: 820,
};
