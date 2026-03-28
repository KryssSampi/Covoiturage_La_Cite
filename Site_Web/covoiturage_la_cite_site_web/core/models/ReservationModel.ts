/**
 * ReservationModel — Modèle unifié pour les réservations
 * Fusion de : ReservationModel (domain), Reservation (dashboard),
 *             ConfirmedReservation (planner), PassengerRideRequest (planner),
 *             ReservationRequest (dashboard)
 *
 * SOURCE UNIQUE DE VÉRITÉ pour toute entité réservation.
 */

// ─── Statuts du cycle de vie ──────────────────────────────────────────────────

/**
 * Statut complet du cycle de vie d'une réservation
 *
 * Cycle normal :
 *   pending → confirmed → in_progress → completed
 *
 * Cycles alternatifs :
 *   pending → refused
 *   pending | confirmed → cancelled
 *   confirmed → no_show
 */
export type ReservationLifecycleStatus =
  | 'pending'       // En attente de réponse du conducteur
  | 'confirmed'     // Acceptée par le conducteur
  | 'refused'       // Refusée par le conducteur
  | 'cancelled'     // Annulée (par passager ou conducteur)
  | 'in_progress'   // Trajet démarré, passager à bord
  | 'completed'     // Trajet terminé, réservation complétée
  | 'no_show';      // Passager absent au départ

// ─── Modèle principal ─────────────────────────────────────────────────────────

/**
 * ReservationModel — Modèle principal pour une réservation
 * Reflète la table "reservations" de la base de données
 */
export interface ReservationModel {
  // ── Identité ──────────────────────────────────────────────────────────────
  /** Identifiant unique, ex: "RSV-2026-00341" */
  id: string;

  // ── Relations ─────────────────────────────────────────────────────────────
  /** ID du trajet réservé (TripModel) */
  tripId: string;
  /** ID du passager (UserModel) */
  passengerId: string;
  /** ID du conducteur (UserModel) — dénormalisé pour faciliter les requêtes */
  driverId: string;

  // ── Statut & cycle de vie ─────────────────────────────────────────────────
  status: ReservationLifecycleStatus;

  // ── Financier ─────────────────────────────────────────────────────────────
  /** Prix par siège au moment de la réservation */
  pricePerSeat: number;
  /** Montant total payé */
  totalAmount: number;

  // ── Dates & temps ─────────────────────────────────────────────────────────
  /** Date/heure de la demande de réservation (ISO) */
  requestedAt: string;
  /** Date/heure d'expiration de la demande (si non traitée) */
  expiresAt: string;
  /** Date/heure d'acceptation par le conducteur */
  confirmedAt?: string;
  /** Date/heure d'annulation */
  cancelledAt?: string;
  /** Date/heure de complétion du trajet */
  completedAt?: string;

  // ── Communication ─────────────────────────────────────────────────────────
  /** Message laissé par le passager lors de la demande */
  passengerMessage?: string;
  /** Raison du refus fournie par le conducteur */
  refusalReason?: string;
  /** Raison d'annulation */
  cancellationReason?: string;

  // ── Embarquement (double confirmation) ───────────────────────────────────
  /** Conducteur a confirmé que le passager est à bord */
  boardingConfirmedByDriver: boolean;
  /** Passager a confirmé son embarquement */
  boardingConfirmedByPassenger: boolean;

  // ── Audit présence passager ───────────────────────────────────────────────
  /**
   * true si le passager s'est présenté au lieu de départ à l'heure prévue
   * (sa position GPS a concordé avec celle du point de départ ±100 m).
   */
  heIsReallyCome?: boolean;

  // ── Évaluation ────────────────────────────────────────────────────────────
  /**
   * Note donnée par le conducteur au passager pour cette réservation (1–5).
   * Stockée ici pour alimenter le trip.averageRating.
   */
  passengerRating?: number;

  // ── Compatibilité ─────────────────────────────────────────────────────────
  /** Score de compatibilité calculé (0–100) */
  compatibilityScore?: number;

  // ── Metadata ──────────────────────────────────────────────────────────────
  createdAt: string;
  updatedAt: string;
}
