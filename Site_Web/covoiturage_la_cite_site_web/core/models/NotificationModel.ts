/**
 * NotificationModel — Modèle unifié et enrichi pour les notifications
 *
 * Chaque type peut embarquer un payload contextuel (tripDetails,
 * reservationDetails, reviewDetails…) pour afficher une vue détaillée
 * complète sans requête supplémentaire.
 */

// ─── Types de notification ────────────────────────────────────────────────────

export type NotificationType =
  | 'reservation_received'    // Conducteur : nouvelle demande de réservation
  | 'reservation_sent'        // Passager   : accusé de réception (envoi confirmé)
  | 'reservation_accepted'    // Passager   : demande acceptée par le conducteur
  | 'reservation_refused'     // Passager   : demande refusée par le conducteur
  | 'reservation_cancelled'   // Les deux   : réservation annulée
  | 'trip_created'            // Conducteur : trajet publié avec succès
  | 'trip_starting_soon'      // Les deux   : rappel de départ (< 1h)
  | 'trip_started'            // Passager   : conducteur a démarré le trajet
  | 'trip_completed'          // Les deux   : trajet terminé avec succès
  | 'trip_cancelled'          // Passager   : trajet annulé par le conducteur
  | 'new_review_received'     // Les deux   : nouvel avis reçu
  | 'cancellation_penalty'    // Les deux   : pénalité d'annulation appliquée
  | 'security_alert'          // Les deux   : alerte de sécurité (nouvelle connexion)
  | 'system';                 // Générique — avec ou sans lien attaché

// ─── Payloads contextuels ────────────────────────────────────────────────────

/** Détails d'un trajet embarqués dans la notification */
export interface NotificationTripDetails {
  tripId: string;
  departure: string;
  arrival: string;
  /** Format "YYYY-MM-DD" */
  date: string;
  /** Format "HH:mm" */
  time: string;
  /**
   * Prix affiché :
   * - passengerPrice (frais 15 % inclus) si le destinataire est un passager
   * - pricePerPassenger si le destinataire est le conducteur
   */
  price: number;
  availableSeats?: number;
  estimatedDurationMinutes?: number;
}

/** Détails d'une réservation embarqués dans la notification */
export interface NotificationReservationDetails {
  reservationId: string;
  /** Nom du passager demandeur (affiché chez le conducteur) */
  passengerName?: string;
  passengerAvatar?: string;
  passengerRating?: number;
  passengerTripCount?: number;
  /** Nom du conducteur (affiché chez le passager) */
  driverName?: string;
  driverAvatar?: string;
}

/** Détails d'un avis reçu */
export interface NotificationReviewDetails {
  reviewId: string;
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  /** Extrait du commentaire (120 chars max) */
  comment: string;
}

/** Détails d'une alerte de sécurité */
export interface NotificationSecurityDetails {
  clientType: 'web' | 'mobile';
  location?: string;
  userAgent?: string;
}

// ─── Modèle principal ─────────────────────────────────────────────────────────

export interface NotificationModel {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: string;

  // ── Destinataire ──────────────────────────────────────────────────────────
  userId: string;

  // ── Contenu principal ─────────────────────────────────────────────────────
  type: NotificationType;
  /** Titre court affiché en gras dans l'alerte et la liste */
  title: string;
  /** Corps du message — lisible sans contexte supplémentaire */
  message: string;

  // ── État ──────────────────────────────────────────────────────────────────
  isRead: boolean;
  /** true → style urgent (rouge + pulse), priorité en tête de liste */
  isImportant: boolean;

  // ── Navigation ────────────────────────────────────────────────────────────
  /** URL de redirection au clic sur l'alerte ou le bouton d'action */
  link?: string;
  /** Libellé du bouton d'action dans la vue détail (dérivé du type si absent) */
  linkLabel?: string;

  // ── Relations ─────────────────────────────────────────────────────────────
  relatedTripId?: string;
  relatedReservationId?: string;

  // ── Payloads enrichis (vue détail sans requête supplémentaire) ────────────
  tripDetails?: NotificationTripDetails;
  reservationDetails?: NotificationReservationDetails;
  reviewDetails?: NotificationReviewDetails;
  securityDetails?: NotificationSecurityDetails;

  // ── Metadata ──────────────────────────────────────────────────────────────
  createdAt: string;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

export const IMPORTANT_NOTIFICATION_TYPES: NotificationType[] = [
  'reservation_received',   // Conducteur : action requise
  'reservation_accepted',   // Passager   : bonne nouvelle urgente
  'trip_starting_soon',
  'trip_started',
  'trip_cancelled',
  'security_alert',
  'cancellation_penalty',
];

export function isImportantNotificationType(type: NotificationType): boolean {
  return IMPORTANT_NOTIFICATION_TYPES.includes(type);
}
