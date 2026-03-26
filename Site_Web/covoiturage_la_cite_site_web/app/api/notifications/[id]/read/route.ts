import { NextResponse } from 'next/server';
import { getNotificationById, markNotificationRead } from '@/core/services/notification-api.service';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const existing = getNotificationById(id);

    if (!existing) {
      return NextResponse.json({ error: 'Notification introuvable' }, { status: 404 });
    }

    return NextResponse.json(markNotificationRead(id));
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
