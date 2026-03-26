// ─────────────────────────────────────────────
// Types pour le système de messagerie en temps réel
// Modèle : Conversation (id + deux participants + messages)
// ─────────────────────────────────────────────

// ─── Message ─────────────────────────────────────────────────────────────────

export type TypeMessage = 'text' | 'system';

/**
 * Un message appartient à une conversation identifiée.
 * senderId et receiverId permettent l'affichage directionnel (moi / autre)
 * sans dépendre d'un état global "utilisateur courant".
 */
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;       // ISO 8601
  isRead: boolean;
  type: TypeMessage;
}

// ─── Conversation ─────────────────────────────────────────────────────────────

/**
 * Une conversation entre deux interlocuteurs.
 * L'ID est déterministe : conv_${[id1, id2].sort().join('_')}
 * Ce format garantit qu'une seule conversation existe entre deux utilisateurs.
 *
 * Le conducteur peut broadcaster → crée un Message dans chaque conversation
 * individuelle conducteur ↔ passager.
 */
export interface Conversation {
  id: string;                       // ex: "conv_driver1_passenger2"
  participantIds: [string, string]; // [userId1, userId2] — toujours ordonné (sort)
  messages: Message[];
  createdAt: string;                // ISO 8601
  updatedAt: string;                // ISO 8601
}

/** Génère l'ID déterministe d'une conversation entre deux utilisateurs */
export function buildConversationId(idA: string, idB: string): string {
  return `conv_${[idA, idB].sort().join('_')}`;
}

// ─── Correspondant ────────────────────────────────────────────────────────────

/** Interlocuteur affiché dans la liste de conversations */
export interface Correspondant {
  id: string;
  prenom: string;
  nom: string;
  initiales: string;
  couleurAvatar: string;
  role: 'driver' | 'passenger';
  estEnLigne: boolean;
  photo?: string;
  telephone?: string;
}

/** Informations sur l'utilisateur courant */
export interface MoiInfo {
  id: string;
  prenom: string;
  nom: string;
  initiales: string;
  couleurAvatar: string;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export interface UseMessagerieReturn {
  /** Toutes les conversations disponibles */
  conversations: Conversation[];
  /** Conversation actuellement affichée */
  activeConversation: Conversation | null;
  /** Correspondant actif (résolu depuis activeConversation) */
  correspondantActif: Correspondant | undefined;
  /** Messages de la conversation active */
  messagesActifs: Message[];
  /** Envoyer un message dans la conversation active */
  sendMessage: (content: string) => void;
  /** Changer la conversation active par ID de correspondant */
  setActiveCorrespondant: (correspondantId: string) => void;
  /** Broadcast : envoie le même message dans toutes les conversations (conducteur → tous passagers) */
  broadcastMessage: (content: string) => void;
  /** Nombre de messages non lus par ID de correspondant */
  unreadCounts: Record<string, number>;
}

// ─── Props composant messagerie ───────────────────────────────────────────────

export interface MessagerieProps {
  roleMoi: 'driver' | 'passenger';
  correspondants: Correspondant[];
  moi: MoiInfo;
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messagesActifs: Message[];
  unreadCounts: Record<string, number>;
  onSendMessage: (content: string) => void;
  onSetActiveCorrespondant: (correspondantId: string) => void;
  onBroadcast: (content: string) => void;
}
