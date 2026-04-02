import { NextResponse } from 'next/server';
import { NotificationService } from '@/server/services/NotificationService';
import { withAuth } from '@/server/auth';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const auth = await withAuth(req);

    const result = await NotificationService.markAsRead(id, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message ?? 'Notification introuvable' }, { status: 404 });
    }

    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
