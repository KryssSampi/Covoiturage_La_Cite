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
  } catch {
    return null;
  }
}

/**
 * Construit les RequestOptions avec le token pour appeler le Server Core.
 */
export async function withAuth(req?: Request): Promise<{ token?: string }> {
  const token = await extractToken(req);
  return token ? { token } : {};
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
