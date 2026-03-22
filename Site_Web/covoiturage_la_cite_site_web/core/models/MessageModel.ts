/**
 * MessageModel — Modèle unifié pour les messages in-trip
 * Fusion de : Message (messagerie.types.ts)
 */
export type MessageType = 'text' | 'system';

/**
 * MessageModel — Modèle principal pour un message de messagerie in-trip
 */
export interface MessageModel {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: string;

  // ── Relations ─────────────────────────────────────────────────────────────
  /** ID du trajet auquel ce message appartient */
  tripId: string;
  /** ID de l'expéditeur (UserModel) */
  senderId: string;
  /** ID du destinataire. null = diffusion à tous les participants */
  recipientId?: string;

  // ── Contenu ───────────────────────────────────────────────────────────────
  content: string;
  type: MessageType;

  // ── État ──────────────────────────────────────────────────────────────────
  isRead: boolean;
  readAt?: string;

  // ── Metadata ──────────────────────────────────────────────────────────────
  createdAt: string;
}
