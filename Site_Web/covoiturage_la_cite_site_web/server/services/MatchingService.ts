/**
 * server/services/MatchingService.ts — Délégation Matching vers Server Core
 *
 * Endpoints : api/matching/*
 */

import { get, post, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface MatchingSearchDto {
  originLat: number;
  originLng: number;
  destinationLat: number;
  destinationLng: number;
  departureTime: string;
  maxDetourMinutes?: number;
  maxResults?: number;
}

export interface MatchingResultDto {
  tripId: string;
  driverName: string;
  score: number;
  geoScore: number;
  behaviorScore: number;
  reliabilityScore: number;
  affinityScore: number;
  scheduleScore: number;
  bonusScore: number;
  detourMinutes: number;
  departureTime: string;
  estimatedPickupTime: string;
  priceEstimate: number;
}

export interface MatchingScoreDto {
  tripId: string;
  totalScore: number;
  geoScore: number;
  behaviorScore: number;
  reliabilityScore: number;
  affinityScore: number;
  scheduleScore: number;
  bonusScore: number;
  breakdown: Record<string, number>;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const MatchingService = {

  /** Recherche de matchs */
  async search(data: MatchingSearchDto, options?: RequestOptions): Promise<ApiResponse<MatchingResultDto[]>> {
    return post<MatchingResultDto[]>('api/matching/search', data, options);
  },

  /** Score de matching pour un trajet */
  async getScore(tripId: string, options?: RequestOptions): Promise<ApiResponse<MatchingScoreDto>> {
    return get<MatchingScoreDto>(`api/matching/score/${tripId}`, options);
  },
};
