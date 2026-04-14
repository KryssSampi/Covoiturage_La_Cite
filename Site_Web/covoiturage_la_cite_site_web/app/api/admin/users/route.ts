/**
 * GET /api/admin/users
 * Délègue au Server Core — GET api/users
 */
import { NextResponse } from 'next/server';
import { UserService } from '@/server/services/UserService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') ?? 1);
    const pageSize = Number(searchParams.get('pageSize') ?? 100);
    const search = searchParams.get('search') ?? undefined;

    const result = await UserService.getAll(page, pageSize, search, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[admin/users]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
