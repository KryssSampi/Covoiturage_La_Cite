import { NextResponse } from 'next/server';
import { AuthSessionService } from '@/server/services/AuthSessionService';
import { getAuthSessionKey, setTokenCookie, setBlockedCookie } from '@/server/auth';

/**
 * POST /api/auth/session/verify-code
 * Vérifie le code OTP. Finalise le login si le code est correct.
 */
export async function POST(req: Request) {
  try {
    const authSessionKey = await getAuthSessionKey();
    if (!authSessionKey) {
      return NextResponse.json({ error: 'Session manquante. Rechargez la page.' }, { status: 401 });
    }

    const body = (await req.json()) as { code?: string; rememberOtp?: boolean };
    if (!body.code) {
      return NextResponse.json({ error: 'Code requis' }, { status: 400 });
    }

    const { json, status } = await AuthSessionService.verifyCode(body.code, authSessionKey, body.rememberOtp ?? false);

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
      return NextResponse.json({ error: json.message ?? 'Erreur de vérification' }, { status });
    }

    // LoginResultDto — code correct, login finalisé
    if (json.data && 'accessToken' in json.data && json.data.accessToken) {
      const response = NextResponse.json({ user: json.data.user });
      setTokenCookie(response, json.data.accessToken, json.data.accessTokenExpiresAt);
      return response;
    }

    // VerifyCodeResponse — code incorrect
    if (json.data && 'remainingAttempts' in json.data) {
      return NextResponse.json({
        codeValid: json.data.success ?? false,
        remainingAttempts: json.data.remainingAttempts,
      });
    }

    return NextResponse.json({ error: 'Réponse inattendue du serveur' }, { status: 500 });
  } catch (err) {
    console.error('[api/auth/session/verify-code]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
