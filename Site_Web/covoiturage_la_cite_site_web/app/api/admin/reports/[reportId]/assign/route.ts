/**
 * POST /api/admin/reports/[reportId]/assign
 * Assigner un signalement à l'admin courant.
 */
import { NextResponse } from 'next/server';
import { withAuth } from '@/server/auth';
import { AdminService } from '@/server/services/AdminService';

export async function POST(
  req: Request,
  { params }: { params: { reportId: string } }
) {
  try {
    const auth = await withAuth(req);
    if (!auth.token) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const result = await AdminService.assignReport(params.reportId, { token: auth.token });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/admin/reports/assign]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
