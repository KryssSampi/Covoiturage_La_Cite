/**
 * ReviewModel — Modèle unifié pour les évaluations
 * Fusion de : EvaluationModel (domain), Review (dashboard/reviews)
 */
export type RevieweeRole = 'driver' | 'passenger';

/**
 * ReviewModel — Modèle principal pour une évaluation post-trajet
 */
export interface ReviewModel {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: string;

  // ── Relations ─────────────────────────────────────────────────────────────
  tripId: string;
  reservationId: string;

  /** ID de l'utilisateur qui évalue */
  reviewerId: string;
  /** ID de l'utilisateur évalué */
  revieweeId: string;
  /** Rôle de l'évalué dans le trajet */
  revieweeRole: RevieweeRole;

  // ── Contenu ───────────────────────────────────────────────────────────────
  /** Note sur 5 */
  rating: number;
  comment?: string;
  /** Tags descriptifs, ex: ["ponctuel", "sympathique", "voiture propre"] */
  tags: string[];

  // ── Metadata ──────────────────────────────────────────────────────────────
  createdAt: string;
}
