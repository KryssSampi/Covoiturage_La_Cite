import { NextResponse } from 'next/server';
import {
  findSigninUser,
  normalizeInstitutionalEmail,
  validateInstitutionalEmail,
} from '@/core/services/auth-api.service';
import { recordWebConnect } from '@/core/services/user-activity-api.service';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = normalizeInstitutionalEmail(body.email);

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    if (!validateInstitutionalEmail(email)) {
      return NextResponse.json({ error: 'Adresse email du College la Cite requise' }, { status: 401 });
    }

    const user = findSigninUser(email);

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouve' }, { status: 404 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Compte desactive' }, { status: 403 });
    }

    recordWebConnect({
      userId: user.id,
      accountCreatedAt: user.createdAt ?? new Date().toISOString(),
      role: user.role?.toString().toLowerCase(),
    });

    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
