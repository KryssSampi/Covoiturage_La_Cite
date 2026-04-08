import { NextResponse } from 'next/server';
import { NotificationService } from '@/server/services/NotificationService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isRead = searchParams.get('isRead');
    // L'utilisateur est déterminé via le JWT (withAuth), pas via query param.
    const auth = await withAuth(req);

    // Si isRead=false demandé (ex : useNotificationPush au login) → uniquement les non lues
    if (isRead === 'false') {
      const result = await NotificationService.getUnread(auth);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 500 });
      }
      return NextResponse.json(result.data ?? []);
    }

    const result = await NotificationService.getAll(1, 50, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json(result.data ?? []);
  } catch (err) {
    console.error('[api/notifications]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
