/**
 * server/services/GpsService.ts — Délégation GPS + SOS vers Server Core
 *
 * Endpoints : api/gps/*, api/sos/*
 */

import { get, post, patch, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types — GPS ───────────────────────────────────────────────────────────────

export interface RecordPositionDto {
  tripId: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  speedKmh?: number;
  headingDegrees?: number;
  capturedAt?: string;
}

export interface GpsPositionResponseDto {
  id: string;
  tripId: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  speedKmh?: number;
  headingDegrees?: number;
  capturedAt: string;
}

// ── Types — SOS ───────────────────────────────────────────────────────────────

export interface TriggerSosDto {
  tripId: string;
  emergencyType: string;
  latitude: number;
  longitude: number;
}

export interface SosAlertResponseDto {
  id: string;
  userId: string;
  tripId: string;
  triggerLatitude: number;
  triggerLongitude: number;
  emergencyType: string;
  emergencyContactsNotified: boolean;
  status: string;
  triggeredAt: string;
  resolvedAt?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const GpsService = {

  /** Enregistrer une position */
  async recordPosition(data: RecordPositionDto, options?: RequestOptions): Promise<ApiResponse<GpsPositionResponseDto>> {
    return post<GpsPositionResponseDto>('api/gps/position', data, options);
  },

  /** Enregistrer un batch de positions */
  async recordBatch(data: RecordPositionDto[], options?: RequestOptions): Promise<ApiResponse<string>> {
    return post<string>('api/gps/positions/batch', data, options);
  },

  /** Dernière position d'un utilisateur sur un trajet */
  async getLatest(tripId: string, userId: string, options?: RequestOptions): Promise<ApiResponse<GpsPositionResponseDto>> {
    return get<GpsPositionResponseDto>(`api/gps/trips/${tripId}/latest/${userId}`, options);
  },

  /** Trace GPS d'un trajet */
  async getTrace(tripId: string, since?: string, options?: RequestOptions): Promise<ApiResponse<GpsPositionResponseDto[]>> {
    return get<GpsPositionResponseDto[]>(`api/gps/trips/${tripId}/trace`, {
      ...options,
      params: { ...(since ? { since } : {}), ...options?.params },
    });
  },
};

export const SosService = {

  /** Déclencher une alerte SOS */
  async trigger(data: TriggerSosDto, options?: RequestOptions): Promise<ApiResponse<SosAlertResponseDto>> {
    return post<SosAlertResponseDto>('api/sos', data, options);
  },

  /** Résoudre une alerte */
  async resolve(alertId: string, options?: RequestOptions): Promise<ApiResponse<SosAlertResponseDto>> {
    return patch<SosAlertResponseDto>(`api/sos/${alertId}/resolve`, undefined, options);
  },

  /** Mes alertes */
  async getMine(options?: RequestOptions): Promise<ApiResponse<SosAlertResponseDto[]>> {
    return get<SosAlertResponseDto[]>('api/sos/mine', options);
  },

  /** Alertes en attente (admin) */
  async getPending(options?: RequestOptions): Promise<ApiResponse<SosAlertResponseDto[]>> {
    return get<SosAlertResponseDto[]>('api/sos/pending', options);
  },
};
