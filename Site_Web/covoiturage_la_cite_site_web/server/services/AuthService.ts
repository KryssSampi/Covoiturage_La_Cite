/**
 * server/services/AuthService.ts — Délégation Auth vers Server Core
 *
 * Endpoints Server Core :
 *   POST api/auth/sso-callback  — Échange id_token Microsoft → JWT
 *   POST api/auth/signin        — Auth mode test (ISTESTMODE=true)
 */

import { post, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types (alignés sur AuthDtos.cs du Server Core) ────────────────────────────

export interface SsoCallbackRequest {
  idToken: string;
}

export interface TestSigninRequest {
  email: string;
}

export interface UserSummaryDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  role: string;
  schoolRole: string;
  canBeDriver: boolean;
}

export interface AuthResultDto {
  accessToken: string;
  expiresAt: string;
  user: UserSummaryDto;
  isNewUser: boolean;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const AuthService = {

  /** SSO Microsoft — échange le code d'autorisation contre un JWT */
  async ssoCallback(data: SsoCallbackRequest, options?: RequestOptions): Promise<ApiResponse<AuthResultDto>> {
    return post<AuthResultDto>('api/auth/sso-callback', data, options);
  },

  /**
   * Mode test (ISTESTMODE=true) — signin par email institutionnel uniquement.
   * Aucune validation Microsoft SSO. Retourne le même AuthResultDto que ssoCallback.
   */
  async testSignin(data: TestSigninRequest, options?: RequestOptions): Promise<ApiResponse<AuthResultDto>> {
    return post<AuthResultDto>('api/auth/signin', data, options);
  },
};
