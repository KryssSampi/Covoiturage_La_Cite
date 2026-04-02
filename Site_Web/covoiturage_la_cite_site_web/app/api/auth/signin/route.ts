import { NextResponse } from 'next/server';
import { AuthService } from '@/server/services/AuthService';
import { setTokenCookie } from '@/server/auth';

// ── MODE TEST (ISTESTMODE=true) ────────────────────────────────────────────────
// Délègue au Server Core — POST /api/auth/signin
// Le Server Core vérifie IsTestMode côté C# et retourne un JWT sans SSO Microsoft.

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    // Délégation vers Server Core
    const result = await AuthService.testSignin({ email });

    if (!result.success || !result.data) {
      return NextResponse.json(
        { error: result.message ?? 'Authentification échouée' },
        { status: 401 }
      );
    }

    // Stocker le JWT du Server Core dans un cookie httpOnly sécurisé
    const response = NextResponse.json(result.data);
    setTokenCookie(response, result.data.accessToken, result.data.expiresAt);
    return response;
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
