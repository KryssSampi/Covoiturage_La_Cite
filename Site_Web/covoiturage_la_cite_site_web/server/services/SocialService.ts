/**
 * server/services/SocialService.ts — Délégation Social vers Server Core
 *
 * Endpoints : api/reviews/*, api/favorites/*, api/reports/*
 */

import { get, post, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types — Reviews ───────────────────────────────────────────────────────────

export interface CreateReviewDto {
  reservationId: string;
  revieweeId: string;
  revieweeRole: string;
  rating: number;
  comment?: string;
  tags?: string[];
}

export interface ReviewResponseDto {
  id: string;
  tripId?: string;
  reservationId: string;
  reviewerId: string;
  revieweeId: string;
  revieweeRole: string;
  rating: number;
  comment?: string;
  tags?: string[];
  isPublished?: boolean;
  createdAt: string;
}

// ── Types — Favorites / Affinity ──────────────────────────────────────────────

export interface AffinityResponseDto {
  id: string;
  userId: string;
  targetUserId: string;
  isActuallyFavorite?: boolean;
  isFavorite?: boolean;
  isBlocked: boolean;
  affinityScore: number;
  totalTripsTogether?: number;
  sharedTrips?: number;
  favoriteSince?: string | null;
  avgRatingGiven?: number | null;
  createdAt?: string;
}

// ── Types — Reports ───────────────────────────────────────────────────────────

export interface CreateReportDto {
  reportedUserId: string;
  category: string;
  description: string;
  tripId?: string;
}

export interface ReportResponseDto {
  id: string;
  reporterId: string;
  reportedUserId: string;
  category: string;
  description: string;
  status: string;
  publicReference: string;
  createdAt: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const ReviewService = {

  /** Créer un avis */
  async create(data: CreateReviewDto, options?: RequestOptions): Promise<ApiResponse<ReviewResponseDto>> {
    return post<ReviewResponseDto>('api/reviews', data, options);
  },

  /** Avis reçus */
  async getReceived(options?: RequestOptions): Promise<ApiResponse<ReviewResponseDto[]>> {
    return get<ReviewResponseDto[]>('api/reviews/received', options);
  },

  /** Avis donnés */
  async getGiven(options?: RequestOptions): Promise<ApiResponse<ReviewResponseDto[]>> {
    return get<ReviewResponseDto[]>('api/reviews/given', options);
  },

  /** Moyenne d'un utilisateur */
  async getAverage(userId: string, options?: RequestOptions): Promise<ApiResponse<number>> {
    return get<number>(`api/reviews/${userId}/average`, options);
  },
};

export const FavoriteService = {

  /** Mes favoris */
  async getFavorites(options?: RequestOptions): Promise<ApiResponse<AffinityResponseDto[]>> {
    return get<AffinityResponseDto[]>('api/favorites', options);
  },

  /** Toggle favori */
  async toggle(targetUserId: string, options?: RequestOptions): Promise<ApiResponse<AffinityResponseDto>> {
    return post<AffinityResponseDto>(`api/favorites/${targetUserId}/toggle`, undefined, options);
  },

  /** Bloquer */
  async block(targetUserId: string, options?: RequestOptions): Promise<ApiResponse<AffinityResponseDto>> {
    return post<AffinityResponseDto>(`api/favorites/${targetUserId}/block`, undefined, options);
  },

  /** Débloquer */
  async unblock(targetUserId: string, options?: RequestOptions): Promise<ApiResponse<AffinityResponseDto>> {
    return post<AffinityResponseDto>(`api/favorites/${targetUserId}/unblock`, undefined, options);
  },

  /** Top affinités */
  async getTopAffinities(top = 10, options?: RequestOptions): Promise<ApiResponse<AffinityResponseDto[]>> {
    return get<AffinityResponseDto[]>('api/favorites/top-affinities', {
      ...options,
      params: { top, ...options?.params },
    });
  },
};

export const ReportService = {

  /** Créer un signalement */
  async create(data: CreateReportDto, options?: RequestOptions): Promise<ApiResponse<ReportResponseDto>> {
    return post<ReportResponseDto>('api/reports', data, options);
  },

  /** Mes signalements */
  async getMine(options?: RequestOptions): Promise<ApiResponse<ReportResponseDto[]>> {
    return get<ReportResponseDto[]>('api/reports/mine', options);
  },

  /** Signalement par référence publique */
  async getByReference(ref: string, options?: RequestOptions): Promise<ApiResponse<ReportResponseDto>> {
    return get<ReportResponseDto>(`api/reports/ref/${ref}`, options);
  },
};
