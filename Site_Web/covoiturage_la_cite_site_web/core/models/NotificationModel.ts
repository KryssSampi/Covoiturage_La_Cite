/**
 * NotificationModel — Modèle unifié pour les notifications
 * Fusion de : Notification (dashboard), types notification.types.ts
 */

export type NotificationType =
  | 'reservation_received'    // Conducteur : nouvelle demande de réservation
  | 'reservation_accepted'    // Passager : demande acceptée
  | 'reservation_refused'     // Passager : demande refusée
  | 'reservation_cancelled'   // Les deux : réservation annulée
  | 'trip_starting_soon'      // Les deux : rappel de départ (30 min)
  | 'trip_started'            // Les deux : trajet démarré
  | 'trip_completed'          // Les deux : trajet terminé
  | 'trip_cancelled'          // Les deux : trajet annulé
  | 'boarding_requested'      // Les deux : confirmation d'embarquement demandée
  | 'new_review_received'     // Les deux : nouvel avis reçu
  | 'cancellation_penalty'    // Les deux : pénalité d'annulation appliquée
  | 'security_alert'          // Les deux : alerte de sécurité
  | 'system';                 // Notification système générique

/**
 * NotificationModel — Modèle principal pour une notification
 */
export interface NotificationModel {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: string;

  // ── Destinataire ──────────────────────────────────────────────────────────
  /** ID de l'utilisateur destinataire */
  userId: string;

  // ── Contenu ───────────────────────────────────────────────────────────────
  type: NotificationType;
  title: string;
  message: string;

  // ── État ──────────────────────────────────────────────────────────────────
  isRead: boolean;
  /** Notification urgente à afficher en tête de liste */
  isImportant: boolean;

  // ── Relations contextuelles ───────────────────────────────────────────────
  /** Lien de navigation contextuel, ex: "/trajets/TRJ-001" */
  link?: string;
  relatedTripId?: string;
  relatedReservationId?: string;

  // ── Metadata ──────────────────────────────────────────────────────────────
  createdAt: string;
}
