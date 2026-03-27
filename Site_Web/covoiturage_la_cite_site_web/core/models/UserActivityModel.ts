/**
 * UserActivityModel — Suivi de l'activité de connexion des utilisateurs
 *
 * Permet au serveur de savoir si un utilisateur est actuellement connecté
 * (web ou mobile) afin de lui pousser les notifications en temps réel via SSE.
 * Si l'utilisateur est déconnecté, les notifications sont mises en file
 * d'attente et affichées dès sa prochaine connexion.
 */

// ─── Enregistrement d'une session de connexion ────────────────────────────────

export interface ConnectionRecord {
  /** Type de client utilisé */
  type: 'web' | 'mobile';
  /** ISO datetime de connexion */
  connectedAt: string;
  /** ISO datetime de déconnexion (undefined = session encore active) */
  disconnectedAt?: string;
  /** User-Agent (navigateur ou app mobile) */
  userAgent?: string;
  /** Région / ville approximative (depuis IP, optionnel) */
  location?: string;
  /** Rôle de l'utilisateur au moment de la connexion (driver | passenger) */
  role?: string;
}

// ─── Modèle principal ─────────────────────────────────────────────────────────

export interface UserActivityModel {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: string;

  /** ID de l'utilisateur (UserModel) */
  userId: string;

  // ── État de connexion courant ──────────────────────────────────────────────
  /** true = une session web (navigateur) est active */
  isCurrentlyConnectedOnWeb: boolean;
  /** true = une session mobile (app native) est active */
  isCurrentlyConnectedOnMobile: boolean;

  // ── Activité ──────────────────────────────────────────────────────────────
  /** Date ISO de la dernière activité (ping ou action) */
  lastSeenAt: string;
  /** Date ISO de création du compte utilisateur */
  accountCreatedAt: string;

  // ── Historique des connexions ──────────────────────────────────────────────
  /**
   * Les 50 dernières sessions de connexion (les plus récentes d'abord).
   * Chaque entrée couvre une session complète (connexion → déconnexion).
   */
  connectionHistory: ConnectionRecord[];
}
