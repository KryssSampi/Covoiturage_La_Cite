import { NextResponse } from 'next/server';
import { AuthService } from '@/server/services/AuthService';
import { setTokenCookie } from '@/server/auth';

/**
 * POST /api/auth/sso-callback
 *
 * Échange le id_token Microsoft Azure AD contre un JWT interne (Server Core).
 * Stocke le JWT dans un cookie httpOnly sécurisé.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { idToken?: string };

    if (!body.idToken) {
      return NextResponse.json({ error: 'idToken requis' }, { status: 400 });
    }

    const result = await AuthService.ssoCallback({ idToken: body.idToken });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.message ?? 'Authentification SSO échouée' },
        { status: 401 }
      );
    }

    const response = NextResponse.json(result.data);
    setTokenCookie(response, result.data.accessToken, result.data.expiresAt);
    return response;
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
