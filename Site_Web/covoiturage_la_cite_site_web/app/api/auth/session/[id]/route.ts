import { NextResponse } from 'next/server';
import { AuthSessionService } from '@/server/services/AuthSessionService';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/session/[id]
 * Retourne l'état de la session AuthSession identifiée par publicId.
 * Si la session est COMPLETED, définit le cookie d'authentification.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: publicId } = await params;
    const result = await AuthSessionService.getStatus(publicId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message ?? 'Session introuvable' },
        { status: 404 },
      );
    }

    const response = NextResponse.json(result.data);

    // Si session terminée avec succès, lire les cookies de session
    if (result.data?.state === 'completed') {
      const cookieStore = await cookies();
      // Le Server Core a déjà défini le cookie via setAuthSessionCookie
      // dans le flow init → on ne fait que retourner les données
    }

    return response;
  } catch (err) {
    console.error('[api/auth/session/[id]] GET', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 },
    );
  }
}