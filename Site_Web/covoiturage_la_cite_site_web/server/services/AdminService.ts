/**
 * server/services/AdminService.ts — Délégation Admin vers Server Core
 *
 * Endpoints : api/admin/*
 */

import { get, post, put, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PlatformStatsDto {
  totalUsers: number;
  totalDrivers: number;
  totalTrips: number;
  activeTrips: number;
  totalReservations: number;
  totalRevenue: number;
  averageRating: number;
  co2Saved: number;
  calculatedAt: string;
}

export interface PlatformConfigDto {
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}

export interface SetConfigDto {
  key: string;
  value: string;
  description?: string;
}

export interface AuditLogDto {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  createdAt: string;
}

export interface ReasonDto {
  reason: string;
}

export interface ResolveReportDto {
  resolution: string;
  action?: string;
}

export interface ReportAdminDto {
  id: string;
  reporterId: string;
  reportedUserId: string;
  category: string;
  description: string;
  status: string;
  assignedTo?: string;
  resolution?: string;
  publicReference: string;
  createdAt: string;
  resolvedAt?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const AdminService = {

  /** Dashboard statistiques */
  async getDashboard(options?: RequestOptions): Promise<ApiResponse<PlatformStatsDto>> {
    return get<PlatformStatsDto>('api/admin/dashboard', options);
  },

  /** Suspendre un utilisateur */
  async suspendUser(userId: string, data: ReasonDto, options?: RequestOptions): Promise<ApiResponse<string>> {
    return post<string>(`api/admin/users/${userId}/suspend`, data, options);
  },

  /** Lever la suspension */
  async unsuspendUser(userId: string, options?: RequestOptions): Promise<ApiResponse<string>> {
    return post<string>(`api/admin/users/${userId}/unsuspend`, undefined, options);
  },

  /** Bannir un utilisateur */
  async banUser(userId: string, data: ReasonDto, options?: RequestOptions): Promise<ApiResponse<string>> {
    return post<string>(`api/admin/users/${userId}/ban`, data, options);
  },

  /** Assigner un signalement */
  async assignReport(reportId: string, options?: RequestOptions): Promise<ApiResponse<ReportAdminDto>> {
    return post<ReportAdminDto>(`api/admin/reports/${reportId}/assign`, undefined, options);
  },

  /** Résoudre un signalement */
  async resolveReport(reportId: string, data: ResolveReportDto, options?: RequestOptions): Promise<ApiResponse<ReportAdminDto>> {
    return post<ReportAdminDto>(`api/admin/reports/${reportId}/resolve`, data, options);
  },

  /** Toute la configuration */
  async getAllConfig(options?: RequestOptions): Promise<ApiResponse<PlatformConfigDto[]>> {
    return get<PlatformConfigDto[]>('api/admin/config', options);
  },

  /** Modifier une config */
  async setConfig(data: SetConfigDto, options?: RequestOptions): Promise<ApiResponse<PlatformConfigDto>> {
    return put<PlatformConfigDto>('api/admin/config', data, options);
  },

  /** Logs d'audit */
  async getAuditLogs(count = 100, options?: RequestOptions): Promise<ApiResponse<AuditLogDto[]>> {
    return get<AuditLogDto[]>('api/admin/audit-logs', {
      ...options,
      params: { count, ...options?.params },
    });
  },

  /** Logs d'audit par entité */
  async getAuditLogsByEntity(entityType: string, entityId: string, options?: RequestOptions): Promise<ApiResponse<AuditLogDto[]>> {
    return get<AuditLogDto[]>(`api/admin/audit-logs/${entityType}/${entityId}`, options);
  },
};
