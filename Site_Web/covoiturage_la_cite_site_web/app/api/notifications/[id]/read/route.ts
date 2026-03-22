/**
 * PATCH /api/notifications/[id]/read
 * Marque une notification comme lue (isRead = true).
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

type Context = { params: Promise<{ id: string }> };
type NotificationRecord = Record<string, unknown>;

export async function PATCH(_req: Request, { params }: Context) {
  try {
    const { id } = await params;

    const existing = persistenceManager.readById<NotificationRecord>('notifications', id);
    if (!existing) {
      return NextResponse.json({ error: 'Notification introuvable' }, { status: 404 });
    }

    const updated = persistenceManager.updateItem<NotificationRecord>('notifications', id, {
      isRead: true,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
