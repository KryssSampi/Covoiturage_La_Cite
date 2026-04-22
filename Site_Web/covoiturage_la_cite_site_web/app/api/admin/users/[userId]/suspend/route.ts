/**
 * POST /api/admin/users/[userId]/suspend
 * Suspendre un compte utilisateur.
 * @body { reason: string }
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

    const body = await req.json();

    if (!body.reason) {
      return NextResponse.json({ error: 'reason est requis' }, { status: 400 });
    }

    const result = await AdminService.suspendUser(
      params.userId,
      { reason: body.reason },
      { token: auth.token }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: result.data });
  } catch (err) {
    console.error('[api/admin/users/suspend]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
