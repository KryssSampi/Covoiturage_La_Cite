/**
 * server/services/NotificationService.ts — Délégation Notifications vers Server Core
 *
 * Endpoints : api/notifications/*
 */

import { get, patch, del, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NotificationResponseDto {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  isImportant: boolean;
  deepLink?: string;
  payload?: string;
  relatedTripId?: string;
  relatedReservationId?: string;
  createdAt: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const NotificationService = {

  /** Toutes les notifications (paginé) */
  async getAll(page = 1, pageSize = 50, options?: RequestOptions): Promise<ApiResponse<NotificationResponseDto[]>> {
    return get<NotificationResponseDto[]>('api/notifications', {
      ...options,
      params: { page, pageSize, ...options?.params },
    });
  },

  /** Notifications non lues */
  async getUnread(options?: RequestOptions): Promise<ApiResponse<NotificationResponseDto[]>> {
    return get<NotificationResponseDto[]>('api/notifications/unread', options);
  },

  /** Nombre de notifications non lues */
  async getUnreadCount(options?: RequestOptions): Promise<ApiResponse<number>> {
    return get<number>('api/notifications/unread-count', options);
  },

  /** Marquer une notification comme lue */
  async markAsRead(notificationId: string, options?: RequestOptions): Promise<ApiResponse> {
    return patch(`api/notifications/${notificationId}/read`, undefined, options);
  },

  /** Marquer toutes comme lues */
  async markAllAsRead(options?: RequestOptions): Promise<ApiResponse> {
    return patch('api/notifications/read-all', undefined, options);
  },

  /** Supprimer une notification */
  async delete(notificationId: string, options?: RequestOptions): Promise<ApiResponse> {
    return del(`api/notifications/${notificationId}`, options);
  },
};
