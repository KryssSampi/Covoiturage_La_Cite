/**
 * POST /api/admin/users/[userId]/unsuspend
 * Lever la suspension d'un compte.
 */
import { NextResponse } from 'next/server';
import { withAuth } from '@/server/auth';
import { AdminService } from '@/server/services/AdminService';

export async function POST(
  req: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const auth = await withAuth(req);
    if (!auth.token) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const result = await AdminService.unsuspendUser(params.userId, { token: auth.token });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: result.data });
  } catch (err) {
    console.error('[api/admin/users/unsuspend]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
