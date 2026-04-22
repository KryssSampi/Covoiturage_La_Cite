/**
 * GET /api/admin/dashboard
 * Statistiques globales de la plateforme — Admin seulement.
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

    const result = await AdminService.getDashboard({ token: auth.token });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/admin/dashboard]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
