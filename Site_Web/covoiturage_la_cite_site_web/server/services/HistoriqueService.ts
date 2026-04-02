/**
 * server/services/HistoriqueService.ts — Délégation Historique vers Server Core
 *
 * Endpoints : api/driver/historique, api/passenger/historique
 */

import { get, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HistoriqueEntryDto {
  tripId: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime?: string;
  status: string;
  role: string;
  price: number;
  rating?: number;
  co2Saved: number;
  passengers?: number;
  driverName?: string;
}

export interface HistoriqueParams {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  status?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const HistoriqueService = {

  /** Historique conducteur */
  async getDriverHistorique(params?: HistoriqueParams, options?: RequestOptions): Promise<ApiResponse<HistoriqueEntryDto[]>> {
    return get<HistoriqueEntryDto[]>('api/driver/historique', {
      ...options,
      params: { ...params, ...options?.params },
    });
  },

  /** Historique passager */
  async getPassengerHistorique(params?: HistoriqueParams, options?: RequestOptions): Promise<ApiResponse<HistoriqueEntryDto[]>> {
    return get<HistoriqueEntryDto[]>('api/passenger/historique', {
      ...options,
      params: { ...params, ...options?.params },
    });
  },
};
