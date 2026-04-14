/**
 * server/auth.ts — Utilitaires d'authentification côté web
 *
 * Gère l'extraction du JWT depuis la requête entrante (cookie ou header)
 * et le stockage du JWT dans un cookie httpOnly sécurisé.
 */

import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/** Nom du cookie contenant le JWT Server Core */
export const TOKEN_COOKIE = 'sc_token';

/**
 * Extrait le JWT depuis la requête :
 *  1. Header `Authorization: Bearer <token>`
 *  2. Cookie `sc_token`
 */
export async function extractToken(req?: Request): Promise<string | null> {
  // 1. Header Authorization
  if (req) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
  }

  // 2. Cookie httpOnly
  try {
    const cookieStore = await cookies();
    return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
  } catch (err) {
    console.error("[server/auth]", err);
    return null;
  }
}

/**
 * Décode un JWT sans vérification de signature (extraction payload uniquement).
 */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const segment = token.split('.')[1];
    if (!segment) return {};
    const padded = segment.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(segment.length / 4) * 4, '=');
    return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/**
 * Construit les RequestOptions avec le token et l'userId extrait du JWT.
 */
export async function withAuth(req?: Request): Promise<{ token?: string; userId?: string }> {
  const token = await extractToken(req);
  if (!token) return {};
  const payload = decodeJwtPayload(token);
  const sub = payload.sub ?? payload.nameid ?? payload.nameidentifier ?? payload.userId;
  const userId = typeof sub === 'string' && sub.length > 0 ? sub : undefined;
  return { token, userId };
}

/**
 * Ajoute le cookie JWT à une NextResponse existante.
 * Cookie httpOnly, Secure en production, SameSite=Lax, path=/, 30 jours.
 */
export function setTokenCookie(response: NextResponse, token: string, expiresAt?: string): NextResponse {
  const maxAge = expiresAt
    ? Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000))
    : 30 * 24 * 60 * 60; // 30 jours par défaut

  response.cookies.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge,
  });

  return response;
}

/**
 * Supprime le cookie JWT (logout).
 */
export function clearTokenCookie(response: NextResponse): NextResponse {
  response.cookies.set(TOKEN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}

// ── Auth Session (multi-step auth) ────────────────────────────────────────

/** Nom du cookie contenant l'idKey de la session d'authentification */
export const AUTH_SESSION_COOKIE = 'auth_session_key';

/**
 * Stocke l'idKey de la AuthSession dans un cookie httpOnly.
 */
export function setAuthSessionCookie(
  response: NextResponse,
  idKey: string,
  expiresAt: string,
): NextResponse {
  const maxAge = Math.max(
    0,
    Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
  );

  response.cookies.set(AUTH_SESSION_COOKIE, idKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth',
    maxAge,
  });

  return response;
}

/**
 * Lit l'idKey de la AuthSession depuis les cookies de la requête entrante.
 */
export async function getAuthSessionKey(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(AUTH_SESSION_COOKIE)?.value ?? null;
  } catch (err) {
    console.error("[server/auth]", err);
    return null;
  }
}

/**
 * Ajoute le cookie de blocage (lisible par JS pour le compteur).
 */
export function setBlockedCookie(
  response: NextResponse,
  blockedUntil: string,
): NextResponse {
  const expiresAt = new Date(blockedUntil);
  const unixSeconds = Math.floor(expiresAt.getTime() / 1000);

  response.cookies.set('auth_blocked_until', String(unixSeconds), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 1000)),
  });

  return response;
}
