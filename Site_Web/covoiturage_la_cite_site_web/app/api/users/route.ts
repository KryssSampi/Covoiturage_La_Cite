/**
 * Route API : GET /api/users
 * Récupère la liste de tous les utilisateurs via le Server Core.
 * Cette route est destinée à l'usage admin uniquement.
 */
import { NextResponse } from 'next/server';
import { UserService } from '@/server/services/UserService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const pageSize = Number(searchParams.get('pageSize') ?? 100);
    const search = searchParams.get('search') ?? undefined;

    const auth = await withAuth(req);
    const result = await UserService.getAll({ page, pageSize, search }, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({ users: result.data }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[API /users] Erreur :', message);

    return NextResponse.json(
      {
        error: 'Impossible de récupérer les utilisateurs.',
        detail: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}
