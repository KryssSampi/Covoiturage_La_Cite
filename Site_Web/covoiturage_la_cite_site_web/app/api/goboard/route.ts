import { NextResponse } from 'next/server';
import { GoTaskService } from '@/server/services/GamificationService';
import { withAuth } from '@/server/auth';

/**
 * GET /api/goboard — GoBoard complet de l'utilisateur courant (Server Core).
 * Agrège : GoScore, palier, rang, GoTasks avec progression, classement, défis éco.
 *
 * Note : Le paramètre ?userId= de l'ancienne route self-service est ignoré —
 * le Server Core détermine l'utilisateur via le JWT.
 */
export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await GoTaskService.getGoBoard(auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json(
      { error: 'Impossible de charger les données GoBoard' },
      { status: 500 },
    );
  }
}
