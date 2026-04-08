import { NextResponse } from 'next/server';
import { AuthSessionService } from '@/server/services/AuthSessionService';
import { getAuthSessionKey, setBlockedCookie } from '@/server/auth';

/**
 * POST /api/auth/session/password-login
 * Vérifie le mot de passe et envoie un OTP 2FA.
 */
export async function POST(req: Request) {
  try {
    const authSessionKey = await getAuthSessionKey();
    if (!authSessionKey) {
      return NextResponse.json({ error: 'Session manquante. Rechargez la page.' }, { status: 401 });
    }

    const body = (await req.json()) as { password?: string };
    if (!body.password) {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
    }

    const { json, status } = await AuthSessionService.passwordLogin(body.password, authSessionKey);

    if (status === 429 && json.data) {
      const blocked = json.data as unknown as { blockedUntil: string; remainingSeconds: number };
      const response = NextResponse.json(
        { blocked: true, blockedUntil: blocked.blockedUntil, remainingSeconds: blocked.remainingSeconds },
        { status: 429 },
      );
      setBlockedCookie(response, blocked.blockedUntil);
      return response;
    }

    if (!json.success) {
      return NextResponse.json({ error: json.message ?? 'Mot de passe incorrect' }, { status });
    }

    // Si LoginResultDto retourné directement (session déjà validée)
    if (json.data?.accessToken) {
      const { setTokenCookie } = await import('@/server/auth');
      const response = NextResponse.json({ user: json.data.user });
      setTokenCookie(response, json.data.accessToken, json.data.accessTokenExpiresAt);
      return response;
    }

    // OTP envoyé (cas normal)
    return NextResponse.json({ otpSent: true });
  } catch (err) {
    console.error('[api/auth/session/password-login]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
