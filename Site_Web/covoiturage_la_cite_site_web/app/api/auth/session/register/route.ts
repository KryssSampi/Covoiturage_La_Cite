import { NextResponse } from 'next/server';
import { AuthSessionService } from '@/server/services/AuthSessionService';
import { getAuthSessionKey, setTokenCookie, setBlockedCookie } from '@/server/auth';

/**
 * POST /api/auth/session/register
 * Crée un compte utilisateur après validation OTP (nouvel utilisateur).
 */
export async function POST(req: Request) {
  try {
    const authSessionKey = await getAuthSessionKey();
    if (!authSessionKey) {
      return NextResponse.json({ error: 'Session manquante. Rechargez la page.' }, { status: 401 });
    }

    const body = (await req.json()) as { firstName?: string; lastName?: string; password?: string };
    if (!body.firstName?.trim() || !body.lastName?.trim()) {
      return NextResponse.json({ error: 'Prénom et nom requis.' }, { status: 400 });
    }
    if (!body.password || body.password.length < 8) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 8 caractères.' }, { status: 400 });
    }

    const { json, status } = await AuthSessionService.register(
      body.firstName.trim(),
      body.lastName.trim(),
      body.password,
      authSessionKey,
    );

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
      return NextResponse.json({ error: json.message ?? 'Erreur lors de la création du compte.' }, { status });
    }

    if (json.data && json.data.accessToken) {
      const response = NextResponse.json({ user: json.data.user });
      setTokenCookie(response, json.data.accessToken, json.data.accessTokenExpiresAt);
      return response;
    }

    return NextResponse.json({ error: 'Réponse inattendue du serveur.' }, { status: 500 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
