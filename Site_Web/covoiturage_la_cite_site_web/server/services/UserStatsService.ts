/**
 * server/services/UserStatsService.ts — Délégation stats → Server Core
 * Endpoint : GET /api/user-stats/{userId}?periode=XXX
 */

import { get, type ApiResponse, type RequestOptions } from '../http-client';

export interface TripStatDto {
  id: string;
  departureLabel: string;
  arrivalLabel: string;
  departureDate: string;
  passengerCount: number;
  distanceKm: number;
  pricePerPassenger: number;
  co2SavedKg: number;
  status: string;
  averageRating: number | null;
}

export interface ReviewStatDto {
  rating: number;
  createdAt: string;
}

export interface BadgeStatDto {
  badgeId: string;
  name: string;
  description: string;
  category: string;
  iconUrl: string;
  obtainedAt: string;
}

export interface UserStatsRawDto {
  userId: string;
  goScore: number;
  totalTripsAsDriver: number;
  totalTripsAsPassenger: number;
  totalCo2SavedKg: number;
  totalDistanceKm: number;
  averageRatingAsDriver: number;
  totalReviewsReceived: number;
  totalEarningsDriver: number;
  trips: TripStatDto[];
  reviews: ReviewStatDto[];
  badges: BadgeStatDto[];
}

export const UserStatsService = {
  getRawStats: (
    userId: string,
    periode: string,
    options?: RequestOptions,
  ): Promise<ApiResponse<UserStatsRawDto>> =>
    get<UserStatsRawDto>(`api/user-stats/${userId}`, {
      ...options,
      params: { periode },
    }),
};
