/**
 * server/services/PipedaService.ts — Délégation PIPEDA vers Server Core
 *
 * Endpoints : api/pipeda/*
 */

import { get, put, post, del, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ConsentDto {
  userId: string;
  locationTracking: boolean;
  dataSharing: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
}

export interface UpdateConsentDto {
  locationTracking?: boolean;
  dataSharing?: boolean;
  analytics?: boolean;
  marketing?: boolean;
}

export interface DataExportRequestDto {
  format?: string;
}

export interface DataExportDto {
  id: string;
  userId: string;
  status: string;
  format: string;
  downloadUrl?: string;
  requestedAt: string;
  completedAt?: string;
  expiresAt?: string;
}

export interface AccountDeletionResultDto {
  success: boolean;
  message: string;
  scheduledAt?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const PipedaService = {

  /** Obtenir les consentements */
  async getConsent(options?: RequestOptions): Promise<ApiResponse<ConsentDto>> {
    return get<ConsentDto>('api/pipeda/consent', options);
  },

  /** Mettre à jour les consentements */
  async updateConsent(data: UpdateConsentDto, options?: RequestOptions): Promise<ApiResponse<ConsentDto>> {
    return put<ConsentDto>('api/pipeda/consent', data, options);
  },

  /** Demander un export de données */
  async requestExport(data?: DataExportRequestDto, options?: RequestOptions): Promise<ApiResponse<DataExportDto>> {
    return post<DataExportDto>('api/pipeda/export', data, options);
  },

  /** Liste des exports */
  async getExports(options?: RequestOptions): Promise<ApiResponse<DataExportDto[]>> {
    return get<DataExportDto[]>('api/pipeda/exports', options);
  },

  /** Suppression du compte (droit à l'oubli) */
  async deleteAccount(options?: RequestOptions): Promise<ApiResponse<AccountDeletionResultDto>> {
    return del<AccountDeletionResultDto>('api/pipeda/account', options);
  },
};
