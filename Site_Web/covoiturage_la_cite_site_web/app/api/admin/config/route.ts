/**
 * GET  /api/admin/config  — Lire la configuration plateforme
 * PUT  /api/admin/config  — Mettre à jour une clé de configuration
 */
import { NextResponse } from 'next/server';
import { withAuth } from '@/server/auth';
import { AdminService } from '@/server/services/AdminService';
import type { SetConfigDto } from '@/server/services/AdminService';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    if (!auth.token) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const result = await AdminService.getAllConfig({ token: auth.token });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data ?? []);
  } catch (err) {
    console.error('[api/admin/config GET]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await withAuth(req);
    if (!auth.token) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const body = (await req.json()) as Partial<SetConfigDto>;

    if (!body.key || body.value === undefined) {
      return NextResponse.json({ error: 'key et value sont requis' }, { status: 400 });
    }

    const result = await AdminService.setConfig(
      { key: body.key, value: String(body.value), description: body.description },
      { token: auth.token }
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/admin/config PUT]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
