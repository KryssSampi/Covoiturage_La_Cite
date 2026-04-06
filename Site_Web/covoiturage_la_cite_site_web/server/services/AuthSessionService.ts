/**
 * server/services/AuthSessionService.ts — Proxy vers le Server Core pour l'authentification par session
 *
 * Gère la communication avec les endpoints /api/auth/* du Server Core.
 * Transmet le cookie auth_session_key dans chaque requête.
 */

import { SERVER_CORE_URL, DEFAULT_TIMEOUT } from '../config';
import { getAuthSessionKey } from '@/server/auth';

// ── Types réponse Server Core ─────────────────────────────────────────────

interface ServerCoreResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

// ── DTOs alignés sur AuthSessionDtos.cs ───────────────────────────────────

export interface InitSessionData {
  publicId: string;
  idKey: string;
  expiresAt: string;
}

export interface VerifyEmailData {
  userExists: boolean;
  otpSent: boolean;
}

export interface VerifyCodeData {
  success: boolean;
  remainingAttempts: number;
}

export interface RenewCodeData {
  success: boolean;
  remainingResends: number;
}

export interface OtpStatusData {
  hasOtp: boolean;
  otpExpiresAt?: string | null;
  lastSentAt?: string | null;
  remainingResends: number;
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

export interface LoginResultData {
  accessToken: string;
  accessTokenExpiresAt: string;
  user: UserSummaryDto;
}

export interface BlockedData {
  isBlocked: boolean;
  blockedUntil: string;
  remainingSeconds: number;
}

// ── Appel générique vers Server Core ──────────────────────────────────────

async function callServerCore<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    authSessionKey?: string;
  } = {},
): Promise<{ json: ServerCoreResponse<T>; status: number }> {
  const { method = 'POST', body, authSessionKey } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (authSessionKey) {
    headers['Cookie'] = `auth_session_key=${authSessionKey}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(`${SERVER_CORE_URL}/${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const json = (await response.json()) as ServerCoreResponse<T>;
    return { json, status: response.status };
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Service ───────────────────────────────────────────────────────────────

export const AuthSessionService = {
  initSession() {
    return callServerCore<InitSessionData>('api/auth/init-session');
  },

  verifyEmail(email: string, authSessionKey: string) {
    return callServerCore<VerifyEmailData>('api/auth/verify-email', {
      body: { email },
      authSessionKey,
    });
  },

  passwordLogin(password: string, authSessionKey: string) {
    return callServerCore<LoginResultData>('api/auth/password-login', {
      body: { password },
      authSessionKey,
    });
  },

  verifyCode(code: string, authSessionKey: string) {
    return callServerCore<LoginResultData & VerifyCodeData>('api/auth/verify-code', {
      body: { code },
      authSessionKey,
    });
  },

  renewCode(authSessionKey: string) {
    return callServerCore<RenewCodeData>('api/auth/renew-code', {
      authSessionKey,
    });
  },

  async otpStatus(authSessionKey?: string) {
    // If no key provided, try to read from cookies on the server
    const key = authSessionKey ?? (await getAuthSessionKey());
    if (!key) {
      const json = { success: false, message: 'Session manquante.' } as unknown as { success: boolean; message: string };
      return { json, status: 401 } as const;
    }

    return callServerCore<OtpStatusData>('api/auth/otp-status', {
      method: 'GET',
      authSessionKey: key,
    });
  },

  register(firstName: string, lastName: string, password: string, authSessionKey: string, schoolRole?: string) {
    return callServerCore<LoginResultData>('api/auth/register', {
      body: { firstName, lastName, password, schoolRole },
      authSessionKey,
    });
  },
  
  logout(authSessionKey?: string) {
    // Invalidate session on Server Core
    return callServerCore('api/auth/logout', {
      method: 'POST',
      authSessionKey,
    });
  },
};
