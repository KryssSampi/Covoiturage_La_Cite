/**
 * server/services/ContentService.ts — Délégation Contenu éditorial vers Server Core
 *
 * Endpoints : api/astuces, api/nouveautes
 */

import { get, post, del, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AstuceResponseDto {
  id: string;
  externalId: string;
  imageUrl?: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  order: number;
}

export interface NouveauteResponseDto {
  id: string;
  externalId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export interface CreateNouveauteDto {
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const ContentService = {

  /** Astuces actives (public) */
  async getAstuces(options?: RequestOptions): Promise<ApiResponse<AstuceResponseDto[]>> {
    return get<AstuceResponseDto[]>('api/astuces', options);
  },

  /** Nouveautés publiées (public) */
  async getNouveautes(options?: RequestOptions): Promise<ApiResponse<NouveauteResponseDto[]>> {
    return get<NouveauteResponseDto[]>('api/nouveautes', options);
  },

  /** Créer une nouveauté (admin) */
  async createNouveaute(dto: CreateNouveauteDto, options?: RequestOptions): Promise<ApiResponse<NouveauteResponseDto>> {
    return post<NouveauteResponseDto>('api/nouveautes', dto, options);
  },

  /** Supprimer une nouveauté (admin) */
  async deleteNouveaute(id: string, options?: RequestOptions): Promise<ApiResponse> {
    return del(`api/nouveautes/${id}`, options);
  },
};
