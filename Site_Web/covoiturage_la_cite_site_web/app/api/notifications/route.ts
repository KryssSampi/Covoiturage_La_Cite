import { NextResponse } from 'next/server';
import { NotificationService } from '@/server/services/NotificationService';
import { withAuth } from '@/server/auth';
import { mapServerNotification } from '@/core/utils/notification-type-mapper';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isRead = searchParams.get('isRead');
    const auth = await withAuth(req);

    if (isRead === 'false') {
      const result = await NotificationService.getUnread(auth);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 500 });
      }
      const mapped = (result.data ?? []).map((n) =>
        mapServerNotification(n as unknown as Record<string, unknown>)
      );
      return NextResponse.json(mapped);
    }

    const result = await NotificationService.getAll(1, 50, auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    const mapped = (result.data ?? []).map((n) =>
      mapServerNotification(n as unknown as Record<string, unknown>)
    );
    return NextResponse.json(mapped);
  } catch (err) {
    console.error('[api/notifications]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
