/**
 * GET /api/notifications   — Liste des notifications d'un utilisateur
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

type NotificationRecord = Record<string, unknown>;

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let notifications = persistenceManager.readAll<NotificationRecord>('notifications');

    if (userId) {
      notifications = notifications.filter((n) => n.userId === userId);
    }

    // Tri antéchronologique
    notifications.sort(
      (a, b) =>
        new Date(b.createdAt as string).getTime() -
        new Date(a.createdAt as string).getTime()
    );

    return NextResponse.json(notifications);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
