/**
 * @file affinite.types.ts
 * @description Types pour le système d'affinité entre utilisateurs.
 *
 * L'affinité est un score qui croît à chaque trajet complété ensemble
 * sans litige déclaré entre les deux utilisateurs.
 */

// ─── Litige dans un trajet ───────────────────────────────────────────────────

/** Type de litige déclarable pendant ou après un trajet */
export type TypeLitige =
  | "comportement"
  | "paiement"
  | "securite"
  | "retard"
  | "annulation"
  | "degradation"
  | "autre";

/** Litige associé à un trajet — lien entre accusateur et accusé */
export interface LitigeTrajet {
  /** ID de l'utilisateur qui déclare le litige */
  accusateurId: string;
  /** ID de l'utilisateur accusé */
  accuseId: string;
  /** Type du litige */
  type: TypeLitige;
  /** Description libre du litige */
  description: string;
}

// ─── Affinité ────────────────────────────────────────────────────────────────

/**
 * Affinité entre deux utilisateurs.
 * Le score croît de +1 à chaque trajet complété ensemble sans litige mutuel.
 */
export interface Affinite {
  /** ID du premier utilisateur */
  userId1: string;
  /** ID du second utilisateur */
  userId2: string;
  /** Score d'affinité (nombre de trajets complétés ensemble sans litige) */
  score: number;
  /** Nombre total de trajets effectués ensemble */
  totalTrajetsEnsemble: number;
  /** Date du dernier trajet ensemble */
  dernierTrajetDate: string;
}
