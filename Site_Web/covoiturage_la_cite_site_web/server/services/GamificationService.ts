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

// ── GoTask / GoBoard ──────────────────────────────────────────────────────────

export interface GoTaskResponseDto {
  id: string;
  taskKey: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  category: string;
  link?: string;
  points: number;
  isCompleted: boolean;
  completedAt?: string;
}

export interface GoBoardResponseDto {
  goScore: number;
  tier: string;
  rang: number;
  pointsGagnes: number;
  goTasks: GoTaskResponseDto[];
  classement: { rang: number; utilisateurId: string; nom: string; score: number; estMoi: boolean }[];
  defisEco: { id: string; title: string; titleEn: string; metricType: string; targetValue: number; rewardPoints: number; progres: number; statut: string }[];
}

export const GoTaskService = {

  /** GoTasks avec progression de l'utilisateur courant */
  async getAll(options?: RequestOptions): Promise<ApiResponse<GoTaskResponseDto[]>> {
    return get<GoTaskResponseDto[]>('api/gotasks', options);
  },

  /** GoBoard complet (GoScore, classement, défis éco, progression GoTasks) */
  async getGoBoard(options?: RequestOptions): Promise<ApiResponse<GoBoardResponseDto>> {
    return get<GoBoardResponseDto>('api/gotasks/goboard', options);
  },

  /** Compléter une GoTask manuellement */
  async complete(taskKey: string, options?: RequestOptions): Promise<ApiResponse<{ completed: boolean; taskKey: string }>> {
    return post(`api/gotasks/${taskKey}/complete`, undefined, options);
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
