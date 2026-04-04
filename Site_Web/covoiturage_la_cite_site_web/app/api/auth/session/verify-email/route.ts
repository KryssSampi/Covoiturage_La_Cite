import { NextResponse } from 'next/server';
import { AuthSessionService } from '@/server/services/AuthSessionService';
import { getAuthSessionKey, setBlockedCookie } from '@/server/auth';

/**
 * POST /api/auth/session/verify-email
 * Vérifie si l'email existe côté Server Core.
 */
export async function POST(req: Request) {
  try {
    const authSessionKey = await getAuthSessionKey();
    if (!authSessionKey) {
      return NextResponse.json({ error: 'Session manquante. Rechargez la page.' }, { status: 401 });
    }

    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const { json, status } = await AuthSessionService.verifyEmail(email, authSessionKey);

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

    return NextResponse.json(json.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
