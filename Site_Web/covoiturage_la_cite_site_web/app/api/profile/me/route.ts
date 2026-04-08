/**
 * GET  /api/profile/me  — Profil complet de l'utilisateur connecté
 * PUT  /api/profile/me  — Mise à jour du profil
 *
 * Route thin — délègue à UserService → Server Core api/users/me
 */
import { NextResponse } from 'next/server';
import { UserService, type UpdateUserDto } from '@/server/services/UserService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await UserService.getMe(auth);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message ?? 'Profil introuvable' },
        { status: result.status ?? 404 },
      );
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/profile/me] GET', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await withAuth(req);
    const body = await req.json() as UpdateUserDto;

    const result = await UserService.updateMe(body, auth);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message ?? 'Mise à jour impossible' },
        { status: result.status ?? 400 },
      );
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/profile/me] PUT', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
