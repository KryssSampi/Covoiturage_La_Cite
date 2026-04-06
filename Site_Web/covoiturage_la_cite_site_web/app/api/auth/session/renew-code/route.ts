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
    console.log('[renew-code] authSessionKey present?', !!authSessionKey);
    if (!authSessionKey) {
      return NextResponse.json({ error: 'Session manquante. Rechargez la page.', debug: { hasAuthSessionKey: false } }, { status: 401 });
    }

    const { json, status } = await AuthSessionService.renewCode(authSessionKey);

    if (status === 429 && json.data) {
      const blocked = json.data as unknown as { blockedUntil: string; remainingSeconds: number };
      const response = NextResponse.json(
        { blocked: true, blockedUntil: blocked.blockedUntil, remainingSeconds: blocked.remainingSeconds, debug: { hasAuthSessionKey: true } },
        { status: 429 },
      );
      setBlockedCookie(response, blocked.blockedUntil);
      return response;
    }

    if (!json.success) {
      return NextResponse.json({ error: json.message ?? 'Impossible de renvoyer le code', debug: { hasAuthSessionKey: true } }, { status });
    }

    return NextResponse.json({
      success: true,
      remainingResends: json.data?.remainingResends ?? 0,
      debug: { hasAuthSessionKey: true },
    });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
