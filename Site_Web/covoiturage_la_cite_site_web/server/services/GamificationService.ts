/**
 * server/services/GamificationService.ts — Délégation Gamification vers Server Core
 *
 * Endpoints : api/badges/*, api/challenges/*
 */

import { get, post, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface BadgeResponseDto {
  id: string;
  name: string;
  description: string;
  iconKey: string;
  category: string;
  requiredPoints?: number;
}

export interface UserBadgeResponseDto {
  id: string;
  userId: string;
  badgeId: string;
  badge: BadgeResponseDto;
  earnedAt: string;
}

export interface EcoChallengeResponseDto {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  unit: string;
  startDate: string;
  endDate: string;
  rewardPoints: number;
  participantCount: number;
}

export interface ChallengeParticipationResponseDto {
  id: string;
  userId: string;
  challengeId: string;
  currentProgress: number;
  isCompleted: boolean;
  joinedAt: string;
  completedAt?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const BadgeService = {

  /** Tous les badges disponibles */
  async getAll(options?: RequestOptions): Promise<ApiResponse<BadgeResponseDto[]>> {
    return get<BadgeResponseDto[]>('api/badges', options);
  },

  /** Mes badges obtenus */
  async getMine(options?: RequestOptions): Promise<ApiResponse<UserBadgeResponseDto[]>> {
    return get<UserBadgeResponseDto[]>('api/badges/mine', options);
  },
};

export const ChallengeService = {

  /** Défis actifs */
  async getActive(options?: RequestOptions): Promise<ApiResponse<EcoChallengeResponseDto[]>> {
    return get<EcoChallengeResponseDto[]>('api/challenges', options);
  },

  /** Rejoindre un défi */
  async join(challengeId: string, options?: RequestOptions): Promise<ApiResponse<ChallengeParticipationResponseDto>> {
    return post<ChallengeParticipationResponseDto>(`api/challenges/${challengeId}/join`, undefined, options);
  },

  /** Mes participations */
  async getMine(options?: RequestOptions): Promise<ApiResponse<ChallengeParticipationResponseDto[]>> {
    return get<ChallengeParticipationResponseDto[]>('api/challenges/mine', options);
  },

  /** Classement d'un défi */
  async getLeaderboard(challengeId: string, top = 20, options?: RequestOptions): Promise<ApiResponse<ChallengeParticipationResponseDto[]>> {
    return get<ChallengeParticipationResponseDto[]>(`api/challenges/${challengeId}/leaderboard`, {
      ...options,
      params: { top, ...options?.params },
    });
  },
};
