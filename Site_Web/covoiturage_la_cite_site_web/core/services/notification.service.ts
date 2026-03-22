import { staticDb } from '@/tests/db/StaticDb';
import type { NotificationModel, NotificationType } from '@/core/models/NotificationModel';

/**
 * NotificationService — Service de gestion des notifications
 */
export const NotificationService = {
  async getAll(): Promise<NotificationModel[]> {
    return staticDb.getAll('notifications');
  },

  async getForUser(userId: string): Promise<NotificationModel[]> {
    const all = await staticDb.getAll('notifications');
    return all
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getUnreadCountForUser(userId: string): Promise<number> {
    const notifications = await NotificationService.getForUser(userId);
    return notifications.filter((n) => !n.isRead).length;
  },

  async markAsRead(notificationId: string): Promise<void> {
    await staticDb.updateById('notifications', notificationId, { isRead: true });
    staticDb.invalidate('notifications');
  },

  async markAllAsReadForUser(userId: string): Promise<void> {
    const all = await staticDb.getAll('notifications');
    const updated = all.map((n) =>
      n.userId === userId ? { ...n, isRead: true } : n
    );
    await staticDb.saveAll('notifications', updated);
    staticDb.invalidate('notifications');
  },

  async create(notification: NotificationModel): Promise<void> {
    await staticDb.add('notifications', notification);
    staticDb.invalidate('notifications');
  },

  async createForEvent(params: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    relatedTripId?: string;
    relatedReservationId?: string;
    isImportant?: boolean;
  }): Promise<void> {
    const notification: NotificationModel = {
      id: NotificationService.generateId(),
      userId: params.userId,
      type: params.type,
      title: params.title,
      message: params.message,
      isRead: false,
      isImportant: params.isImportant ?? false,
      link: params.link,
      relatedTripId: params.relatedTripId,
      relatedReservationId: params.relatedReservationId,
      createdAt: new Date().toISOString(),
    };
    await NotificationService.create(notification);
  },

  generateId(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `NOTIF-${year}-${rand}`;
  },
};
