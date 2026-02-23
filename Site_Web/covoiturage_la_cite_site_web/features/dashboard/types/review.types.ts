/**
 * @file review.types.ts
 * @description Types et interfaces pour le système d'avis utilisateur.
 * Utilisé par ReviewsSection.
 */

// ─── Interface principale ────────────────────────────────────────────────────

/**
 * Représente un avis laissé sur l'utilisateur connecté par un autre membre.
 *
 * TODO: GET /api/users/{userId}/reviews?limit=5&sort=date_desc
 */
export interface Review {
  /** Identifiant unique de l'avis */
  id: number;
  /** Prénom + nom de l'évaluateur affiché */
  reviewer: string;
  /** UUID de l'évaluateur — utilisé pour le lien vers son profil public */
  reviewerid: string;
  /** Chemin vers la photo de profil de l'évaluateur */
  reviewerpicture: string;
  /** Note sur 5 (supporte les demi-étoiles ex: 3.5) */
  rating: number;
  /** Date de l'avis au format ISO "YYYY-MM-DD" */
  date: string;
  /** Commentaire libre laissé par l'évaluateur */
  comment: string;
}

// ─── Types pour les stats ────────────────────────────────────────────────────

/**
 * Statistiques sommaires de l'utilisateur affichées dans StatisticSection.
 *
 * TODO: GET /api/users/{userId}/stats/summary
 *   Retourne ces 4 valeurs agrégées côté serveur.
 */
export interface UserStatsSummary {
  /** Nombre de trajets partagés (conducteur + passager) */
  tripsCount: number;
  /** CO₂ économisé en kg (calcul backend basé sur km × facteur émission) */
  co2SavedKg: number;
  /** Note moyenne reçue sur 5 (arrondie à 1 décimale) */
  averageRating: number;
  /** Score de gamification GoScore (0-1000) */
  goScore: number;
}
