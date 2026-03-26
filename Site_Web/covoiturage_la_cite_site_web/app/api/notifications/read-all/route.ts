import { NextResponse } from 'next/server';
import { markAllNotificationsRead } from '@/core/services/notification-api.service';

export async function POST(req: Request) {
  try {
    const { userId } = (await req.json()) as { userId: string };

    if (!userId) {
      return NextResponse.json({ error: 'userId est requis' }, { status: 400 });
    }

    return NextResponse.json({ updatedCount: markAllNotificationsRead(userId) });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
