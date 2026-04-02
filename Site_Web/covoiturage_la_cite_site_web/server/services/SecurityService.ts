/**
 * server/services/SecurityService.ts — Délégation Security vers Server Core
 *
 * Endpoints : api/security/*
 */

import { get, post, del, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DeviceEnrollDto {
  deviceFingerprint: string;
  deviceName?: string;
  platform?: string;
}

export interface DeviceEnrollResultDto {
  deviceId: string;
  publicKey: string;
  enrolledAt: string;
}

export interface SignatureValidateDto {
  deviceId: string;
  signature: string;
  payload: string;
}

export interface SignatureValidateResultDto {
  valid: boolean;
  deviceId: string;
}

export interface HeartbeatDto {
  deviceId: string;
  latitude?: number;
  longitude?: number;
}

export interface HeartbeatResultDto {
  acknowledged: boolean;
  serverTime: string;
}

export interface KeyRotationDto {
  deviceId: string;
}

export interface KeyRotationResultDto {
  deviceId: string;
  newPublicKey: string;
  rotatedAt: string;
}

export interface GlobalRotationResultDto {
  rotatedCount: number;
  rotatedAt: string;
}

export interface SecurityLogDto {
  id: string;
  userId: string;
  action: string;
  deviceId?: string;
  ipAddress?: string;
  details?: string;
  createdAt: string;
}

export interface WebSessionCreateDto {
  userAgent: string;
  ipAddress: string;
}

export interface WebSessionDto {
  sessionId: string;
  userId: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
  isValid: boolean;
}

export interface WebSessionValidateDto {
  sessionId: string;
}

export interface WebSessionValidateResultDto {
  valid: boolean;
  sessionId: string;
  expiresAt?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const SecurityService = {

  /** Enrôler un appareil */
  async enroll(data: DeviceEnrollDto, options?: RequestOptions): Promise<ApiResponse<DeviceEnrollResultDto>> {
    return post<DeviceEnrollResultDto>('api/security/enroll', data, options);
  },

  /** Valider une signature */
  async validateSignature(data: SignatureValidateDto, options?: RequestOptions): Promise<ApiResponse<SignatureValidateResultDto>> {
    return post<SignatureValidateResultDto>('api/security/validate', data, options);
  },

  /** Heartbeat appareil */
  async heartbeat(data: HeartbeatDto, options?: RequestOptions): Promise<ApiResponse<HeartbeatResultDto>> {
    return post<HeartbeatResultDto>('api/security/heartbeat', data, options);
  },

  /** Rotation de clé individuelle */
  async rotateKey(data: KeyRotationDto, options?: RequestOptions): Promise<ApiResponse<KeyRotationResultDto>> {
    return post<KeyRotationResultDto>('api/security/rotate', data, options);
  },

  /** Rotation globale */
  async globalRotation(options?: RequestOptions): Promise<ApiResponse<GlobalRotationResultDto>> {
    return post<GlobalRotationResultDto>('api/security/rotation/global', undefined, options);
  },

  /** Log de sécurité */
  async getLog(options?: RequestOptions): Promise<ApiResponse<SecurityLogDto[]>> {
    return get<SecurityLogDto[]>('api/security/log', options);
  },

  /** Créer une session web */
  async createWebSession(data: WebSessionCreateDto, options?: RequestOptions): Promise<ApiResponse<WebSessionDto>> {
    return post<WebSessionDto>('api/security/web-session', data, options);
  },

  /** Valider une session web */
  async validateWebSession(data: WebSessionValidateDto, options?: RequestOptions): Promise<ApiResponse<WebSessionValidateResultDto>> {
    return post<WebSessionValidateResultDto>('api/security/web-session/validate', data, options);
  },

  /** Supprimer une session web */
  async deleteWebSession(sessionId: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return del<void>(`api/security/web-session`, { ...options, params: { sessionId } });
  },
};
