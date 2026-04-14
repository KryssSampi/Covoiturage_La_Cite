/**
 * server/services/ChatService.ts — Délégation Messagerie instantanée vers Server Core
 *
 * Endpoints : api/messages/*
 */

import { get, post, patch, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types (alignés sur ChatDtos du Server Core) ───────────────────────────────

export interface ChatMessageResponseDto {
  id: string;
  tripId: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: 'text' | 'image' | 'system';
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface SendMessageDto {
  tripId: string;
  recipientId: string;
  content: string;
  type?: 'text' | 'image';
}

export interface ConversationSummaryDto {
  tripId: string;
  tripLabel: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessageContent: string;
  lastMessageAt: string;
  unreadCount: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const ChatService = {

  /** Envoie un message dans la conversation d'un trajet */
  async send(dto: SendMessageDto, options?: RequestOptions): Promise<ApiResponse<ChatMessageResponseDto>> {
    return post<ChatMessageResponseDto>('api/messages', dto, options);
  },

  /** Historique paginé d'une conversation (tripId) */
  async getConversation(
    tripId: string,
    page = 1,
    pageSize = 50,
    options?: RequestOptions,
  ): Promise<ApiResponse<ChatMessageResponseDto[]>> {
    return get<ChatMessageResponseDto[]>(`api/messages/${tripId}`, {
      ...options,
      params: { page, pageSize, ...options?.params },
    });
  },

  /** Liste des conversations actives de l'utilisateur */
  async getConversations(options?: RequestOptions): Promise<ApiResponse<ConversationSummaryDto[]>> {
    return get<ConversationSummaryDto[]>('api/messages/conversations', options);
  },

  /** Marque tous les messages d'une conversation comme lus */
  async markRead(tripId: string, options?: RequestOptions): Promise<ApiResponse> {
    return patch(`api/messages/${tripId}/read`, undefined, options);
  },

  /** Nombre total de messages non lus */
  async getUnreadCount(options?: RequestOptions): Promise<ApiResponse<number>> {
    return get<number>('api/messages/unread-count', options);
  },
};
