import { NextResponse } from 'next/server';
import { GoTaskService } from '@/server/services/GamificationService';
import { withAuth } from '@/server/auth';

/**
 * GET /api/gotasks — GoTasks avec progression de l'utilisateur courant (Server Core).
 */
export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await GoTaskService.getAll(auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json(result.data ?? []);
  } catch {
    return NextResponse.json({ error: 'Impossible de lire les gotasks' }, { status: 500 });
  }
}
