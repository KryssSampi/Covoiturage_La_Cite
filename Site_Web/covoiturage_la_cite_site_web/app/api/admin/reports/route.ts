/**
 * GET /api/admin/reports
 * Liste des signalements — Admin seulement.
 * Query params : status (Pending | InProgress | Resolved | Dismissed)
 */
import { NextResponse } from 'next/server';
import { withAuth } from '@/server/auth';
import { AdminService } from '@/server/services/AdminService';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    if (!auth.token) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') ?? undefined;
    const count = Number(searchParams.get('count') ?? 100);

    // Récupère les logs d'audit comme proxy pour les signalements jusqu'à ce que
    // le Server Core expose un endpoint /api/admin/reports dédié.
    // Pour l'instant on filtre les AuditLog de type "Report".
    const result = await AdminService.getAuditLogs(count, {
      token: auth.token,
      params: status ? { entityType: 'Report', status } : { entityType: 'Report' },
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data ?? []);
  } catch (err) {
    console.error('[api/admin/reports]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
