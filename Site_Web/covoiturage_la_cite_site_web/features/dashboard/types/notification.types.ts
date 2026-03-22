/**
 * @file notification.types.ts
 * @description Types et interfaces pour le système de notifications du dashboard.
 * Utilisé par NotificationsSection et useNotifications.
 */

// ─── Enum ────────────────────────────────────────────────────────────────────

/**
 * Catégories de notifications supportées par la plateforme.
 * Détermine l'icône, la couleur et la priorité d'affichage.
 */
export enum NotificationType {
  Confirmation  = "confirmation",
  UrgentRappel  = "urgent rappel",
  Annulation    = "annulation",
  Retard        = "retard",
  Infos         = "infos",
  Rappel        = "rappel",
  NouvelleAvis  = "nouvelle-avis",
  AlerteTrajet  = "alerte-trajet",
  Any           = "any",
}

// ─── Interface principale ────────────────────────────────────────────────────

/**
 * Représente une notification reçue par l'utilisateur.
 * Les champs date et time sont séparés pour permettre un tri précis (voir OrderNotifications).
 */
export interface Notification {
  /** Identifiant unique de la notification */
  id: string;
  /** ID de l'utilisateur destinataire — pour filtrer les notifications par utilisateur */
  userId: string;
  /** Titre court affiché en gras */
  title: string;
  /** Type déterminant l'icône et le comportement visuel */
  type: NotificationType;
  /** Corps du message affiché à l'utilisateur */
  message: string;
  /** Date au format ISO : "YYYY-MM-DD" */
  date: string;
  /** Heure au format "HH:mm" */
  time: string;
  /** false = point bleu non-lu affiché, true = notification déjà consultée */
  isRead: boolean;
  /** Notification urgente — style rouge + animation pulse */
  isImportant: boolean;
  /** ID du trajet lié (si applicable) */
  relatedTripId: string | null;
  /** ID de la réservation liée (si applicable) */
  relatedReservationId: string | null;
  /** Date/heure complète ISO de création */
  createdAt: string;
  /** Lien de navigation associé (optionnel — ex. wishing trip → page de recherche) */
  link?: string;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

/**
 * Types de notifications considérés comme urgents.
 * Déclenchent un style visuel rouge et une animation pulse.
 */
export const IMPORTANT_NOTIFICATION_TYPES: NotificationType[] = [
  NotificationType.UrgentRappel,
  NotificationType.Retard,
];

/**
 * Seuil d'affichage du badge "99+" sur le compteur de non-lus.
 */
export const NOTIFICATION_COUNT_MAX_DISPLAY = 99;
