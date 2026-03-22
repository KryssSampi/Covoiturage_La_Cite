/**
 * POST /api/notifications/read-all
 * @body { userId: string }
 * Marque toutes les notifications d'un utilisateur comme lues.
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

type NotificationRecord = Record<string, unknown>;

export async function POST(req: Request) {
  try {
    const { userId } = (await req.json()) as { userId: string };

    if (!userId) {
      return NextResponse.json({ error: 'userId est requis' }, { status: 400 });
    }

    const notifications = persistenceManager.readAll<NotificationRecord>('notifications');
    let updatedCount = 0;

    for (const n of notifications) {
      if (n.userId === userId && !n.isRead) {
        persistenceManager.updateItem<NotificationRecord>('notifications', n.id as string, {
          isRead: true,
        });
        updatedCount++;
      }
    }

    return NextResponse.json({ updatedCount });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
