import { NextResponse } from 'next/server';
import { SERVER_CORE_URL } from '@/server/config';
import { setTokenCookie } from '@/server/auth';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/refresh
 * Transmet la requête au Server Core pour renouveller l'access token via le
 * refresh token côté Server Core. Si Server Core renvoie un nouveau token,
 * on l'écrit dans un cookie httpOnly `sc_token` via `setTokenCookie`.
 */
export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') ?? '';
    const coreRes = await fetch(`${SERVER_CORE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: cookieHeader ? { Cookie: cookieHeader } : undefined,
    });

    const data = await coreRes.json().catch(() => ({}));
    // Normaliser le payload : ApiResponse<T> utilise { Success, Data }
    const payload = data?.Data ?? data ?? {};

    // Si le Server Core retourne un nouveau access token, injectez-le en cookie
    const accessToken = payload?.AccessToken ?? payload?.accessToken ?? payload?.token;
    const accessExpiresAt = payload?.AccessTokenExpiresAt ?? payload?.accessTokenExpiresAt ?? payload?.expiresAt;
    const refreshToken = payload?.RefreshToken ?? payload?.refreshToken;
    const refreshExpiresAt = payload?.RefreshTokenExpiresAt ?? payload?.refreshTokenExpiresAt;

    if (coreRes.ok && accessToken) {
      const response = NextResponse.json(data, { status: 200 });
      setTokenCookie(response, accessToken, accessExpiresAt);

      // Écrire aussi le refresh token si présent (cookie httpOnly `sc_refresh`)
      if (refreshToken) {
        const maxAge = refreshExpiresAt
          ? Math.max(0, Math.floor((new Date(refreshExpiresAt).getTime() - Date.now()) / 1000))
          : 24 * 60 * 60; // 24h par défaut

        response.cookies.set('sc_refresh', refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge,
        });
      }

      return response;
    }

    // Transmettez l'erreur telle quelle
    return NextResponse.json(data ?? { error: 'Refresh failed' }, { status: coreRes.status });
  } catch (err) {
    console.error('[api/auth/refresh]', err);
    return NextResponse.json({ error: 'Refresh unavailable' }, { status: 503 });
  }
}
