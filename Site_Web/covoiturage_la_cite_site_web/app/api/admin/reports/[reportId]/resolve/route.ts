/**
 * POST /api/admin/reports/[reportId]/resolve
 * Résoudre un signalement avec une décision.
 * @body { resolution: string; action?: string }
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

    const body = await req.json();

    if (!body.resolution) {
      return NextResponse.json({ error: 'resolution est requis' }, { status: 400 });
    }

    const result = await AdminService.resolveReport(
      params.reportId,
      { resolution: body.resolution, action: body.action },
      { token: auth.token }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/admin/reports/resolve]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
