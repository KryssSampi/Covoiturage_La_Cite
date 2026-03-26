import { sortByDateDesc } from '@/core/utils/api-route.utils';
import { persistenceManager } from '@/tests/PersistenceManager';

export type NotificationRecord = Record<string, unknown>;

export function queryNotifications(userId?: string | null): NotificationRecord[] {
  const notifications = persistenceManager.readAll<NotificationRecord>('notifications');
  const filtered = userId
    ? notifications.filter((notification) => notification.userId === userId)
    : notifications;

  return sortByDateDesc(filtered, (notification) => notification.createdAt as string | undefined);
}

export function getNotificationById(id: string): NotificationRecord | null {
  return persistenceManager.readById<NotificationRecord>('notifications', id);
}

export function markNotificationRead(id: string): NotificationRecord | null {
  return persistenceManager.updateItem<NotificationRecord>('notifications', id, { isRead: true });
}

export function markAllNotificationsRead(userId: string): number {
  const notifications = persistenceManager.readAll<NotificationRecord>('notifications');
  let updatedCount = 0;

  for (const notification of notifications) {
    if (notification.userId === userId && !notification.isRead) {
      persistenceManager.updateItem<NotificationRecord>('notifications', notification.id as string, {
        isRead: true,
      });
      updatedCount += 1;
    }
  }

  return updatedCount;
}
