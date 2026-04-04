import { NextResponse } from 'next/server';
import { AuthSessionService } from '@/server/services/AuthSessionService';
import { getAuthSessionKey, setBlockedCookie } from '@/server/auth';

/**
 * POST /api/auth/session/renew-code
 * Renvoie un nouveau code OTP (max 3 renvois).
 */
export async function POST() {
  try {
    const authSessionKey = await getAuthSessionKey();
    if (!authSessionKey) {
      return NextResponse.json({ error: 'Session manquante. Rechargez la page.' }, { status: 401 });
    }

    const { json, status } = await AuthSessionService.renewCode(authSessionKey);

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
      return NextResponse.json({ error: json.message ?? 'Impossible de renvoyer le code' }, { status });
    }

    return NextResponse.json({
      success: true,
      remainingResends: json.data?.remainingResends ?? 0,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
