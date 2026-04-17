/**
 * server/services/UserService.ts — Délégation Users vers Server Core
 *
 * Endpoints : api/users/*
 */

import { get, patch, del, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types (alignés sur UserDtos du Server Core) ───────────────────────────────

export interface UserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  phone?: string;
  notificationEmail?: string;
  avatarUrl?: string;
  bio?: string;
  microsoftSsoId?: string;
  goScore: number;
  createdAt: string;
  updatedAt: string;
  driverProfile?: unknown;
  preferences?: unknown;
  stats?: unknown;
}

export interface UserPublicDto {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: string;
  goScore: number;
  memberSince: string;
  driverStats?: unknown;
}

export interface UpdatePreferencesDto {
  musicAccepted?: boolean;
  petsAccepted?: boolean;
  smokingAccepted?: boolean;
  conversationLevel?: string;
  emailPrimordiales?: boolean;
  emailSecondaires?: boolean;
  emailNegligeables?: boolean;
  pushPrimordiales?: boolean;
  pushSecondaires?: boolean;
  pushNegligeables?: boolean;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  bio?: string;
  notificationEmail?: string;
  language?: string;
  languagesSpoken?: string[];
  canBeDriver?: boolean;
  preferences?: UpdatePreferencesDto;
}

export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const UserService = {

  /** Profil de l'utilisateur connecté */
  async getMe(options?: RequestOptions): Promise<ApiResponse<UserResponseDto>> {
    return get<UserResponseDto>('api/users/me', options);
  },

  /** Mettre à jour le profil */
  async updateMe(data: UpdateUserDto, options?: RequestOptions): Promise<ApiResponse<UserResponseDto>> {
    return patch<UserResponseDto>('api/users/me', data, options);
  },

  /** Supprimer le compte */
  async deleteAccount(options?: RequestOptions): Promise<ApiResponse> {
    return del('api/users/me', options);
  },

  /** Profil public d'un utilisateur */
  async getPublicProfile(userId: string, options?: RequestOptions): Promise<ApiResponse<UserPublicDto>> {
    return get<UserPublicDto>(`api/users/${userId}/public`, options);
  },

  /** Liste paginée de tous les utilisateurs */
  async getAll(page = 1, pageSize = 20, search?: string, options?: RequestOptions): Promise<ApiResponse<PaginatedResult<UserResponseDto>>> {
    return get<PaginatedResult<UserResponseDto>>('api/users', {
      ...options,
      params: { page, pageSize, ...(search ? { search } : {}), ...options?.params },
    });
  },

  /** Obtenir un utilisateur par ID */
  async getById(userId: string, options?: RequestOptions): Promise<ApiResponse<UserResponseDto>> {
    return get<UserResponseDto>(`api/users/${userId}`, options);
  },
};
