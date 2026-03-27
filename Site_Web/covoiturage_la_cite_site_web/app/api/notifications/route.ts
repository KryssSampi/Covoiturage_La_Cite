import { NextResponse } from 'next/server';
import { queryNotifications } from '@/core/services/notification-api.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const isReadParam = searchParams.get('isRead');
    const isRead = isReadParam === 'true' ? true : isReadParam === 'false' ? false : null;
    return NextResponse.json(queryNotifications(userId, isRead));
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
