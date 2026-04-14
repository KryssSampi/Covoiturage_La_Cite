import { NextResponse } from 'next/server';
import { NotificationService } from '@/server/services/NotificationService';
import { withAuth } from '@/server/auth';

export async function POST(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await NotificationService.markAllAsRead(auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/notifications/read-all]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
