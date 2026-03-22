// ─────────────────────────────────────────────
// Types pour le système de messagerie en temps réel
// ─────────────────────────────────────────────

export type RoleMessage = 'moi' | 'autre';
export type TypeMessage = 'texte' | 'systeme';

export interface Message {
  id: string;
  role: RoleMessage;
  contenu: string;
  horodatage: Date;
  type: TypeMessage;
  correspondantId?: string;
  estLu?: boolean;
}

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

export interface MoiInfo {
  id: string;
  prenom: string;
  nom: string;
  initiales: string;
  couleurAvatar: string;
}

export interface ConversationState {
  correspondantActifId: string;
  messages: Record<string, Message[]>;
}

export interface MessagerieProps {
  roleMoi: 'driver' | 'passenger';
  correspondants: Correspondant[];
  moi: MoiInfo;
  conversationState: ConversationState;
  onEnvoyerMessage: (contenu: string) => void;
  onChangerCorrespondant: (id: string) => void;
  onBroadcast: (contenu: string) => void;
}

export interface UseMessagerieReturn {
  conversationState: ConversationState;
  messagesActifs: Message[];
  correspondantActif: Correspondant | undefined;
  envoyerMessage: (contenu: string) => void;
  simulerReception: (contenu: string) => void;
  broadcast: (contenu: string) => void;
  changerCorrespondant: (id: string) => void;
  nbNonLus: Record<string, number>;
}
