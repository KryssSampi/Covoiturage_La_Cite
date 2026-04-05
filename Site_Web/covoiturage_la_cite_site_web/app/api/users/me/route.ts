import { NextResponse } from 'next/server';
import { UserService } from '@/server/services/UserService';
import { withAuth } from '@/server/auth';

/** GET /api/users/me — Profil complet de l'utilisateur connecté */
export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await UserService.getMe(auth);
    if (!result.success) return NextResponse.json({ error: result.message }, { status: 401 });
    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

/** PATCH /api/users/me — Mise à jour partielle du profil */
export async function PATCH(req: Request) {
  try {
    const auth = await withAuth(req);
    const body = await req.json();
    const result = await UserService.updateMe(body, auth);
    if (!result.success) return NextResponse.json({ error: result.message }, { status: 400 });
    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
