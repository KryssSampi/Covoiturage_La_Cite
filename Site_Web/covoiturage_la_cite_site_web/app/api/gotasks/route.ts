import { NextResponse } from 'next/server';
import { GoTaskService } from '@/server/services/GamificationService';
import { withAuth } from '@/server/auth';

/** Décode le champ `sub` du JWT sans vérification (Server Core l'a déjà vérifié). */
function decodeJwtSub(token?: string): string | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = Buffer.from(payload, 'base64url').toString('utf-8');
    return (JSON.parse(json) as Record<string, unknown>).sub as string ?? null;
  } catch {
    return null;
  }
}

/**
 * GET /api/gotasks — GoTasks avec progression de l'utilisateur courant (Server Core).
 * Transforme les champs PascalCase/camelCase du Server Core vers le format attendu par le frontend.
 */
export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await GoTaskService.getAll(auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    const userId = decodeJwtSub(auth.token);
    const items = result.data ?? [];

    // Transforme GoTaskResponseDto (Server Core) → GoTask (frontend)
    const mapped = items.map((t) => ({
      id:            t.taskKey || String(t.id),
      titlefr:       t.titleFr       ?? '',
      titleen:       t.titleEn       ?? '',
      descriptionfr: t.descriptionFr ?? '',
      descriptionen: t.descriptionEn ?? '',
      category:      (t.category ?? 'mixte').toLowerCase(),
      link:          t.link          ?? '',
      points:        t.points        ?? 0,
      // La progression est stockée côté serveur ; on crée une entrée synthétique pour l'utilisateur courant
      progression: userId
        ? [{ userId, isDone: t.isCompleted ?? false }]
        : [],
    }));

    return NextResponse.json(mapped);
  } catch (err) {
    console.error('[api/gotasks]', err);
    return NextResponse.json({ error: 'Impossible de lire les gotasks' }, { status: 500 });
  }
}
