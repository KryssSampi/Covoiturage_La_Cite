import { NextResponse } from 'next/server';
import { AuthSessionService } from '@/server/services/AuthSessionService';
import { setAuthSessionCookie } from '@/server/auth';

/**
 * POST /api/auth/session/init
 * Crée une AuthSession côté Server Core.
 * Stocke l'idKey en cookie httpOnly sur le navigateur.
 */
export async function POST() {
  try {
    const { json, status } = await AuthSessionService.initSession();

    if (!json.success || !json.data) {
      return NextResponse.json(
        { error: 'Tentative de connexion expirée' },
        { status: status === 200 ? 500 : status },
      );
    }

    const { publicId, idKey, expiresAt } = json.data;

    const response = NextResponse.json({ publicId });
    setAuthSessionCookie(response, idKey, expiresAt);

    return response;
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
