/**
 * server/services/DraftService.ts — Délégation Brouillons vers Server Core
 *
 * Endpoints : api/drafts/*
 */

import { get, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DraftDto {
  id: string;
  userId: string;
  type: string;
  data: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const DraftService = {

  /** Tous les brouillons de l'utilisateur */
  async getDrafts(options?: RequestOptions): Promise<ApiResponse<DraftDto[]>> {
    return get<DraftDto[]>('api/drafts', options);
  },

  /** Un brouillon par ID */
  async getDraftById(id: string, options?: RequestOptions): Promise<ApiResponse<DraftDto>> {
    return get<DraftDto>(`api/drafts/${id}`, options);
  },
};
