/**
 * @file survey-destination.types.ts
 * @description Types pour les destinations surveillées (récentes, habituelles, souhaitées).
 *
 * Un SurveyDestination stocke les coordonnées de départ/arrivée et les IDs
 * des trajets retournés par la dernière recherche serveur pour cette destination.
 * Les objets Trip complets sont résolus côté consommateur via les IDs.
 */

// ─── Type de surveillance ────────────────────────────────────────────────────

/** Type de destination surveillée */
export type SurveyDestinationType = "recent" | "usual" | "wishing";

// ─── Interface principale ────────────────────────────────────────────────────

/**
 * Destination surveillée avec résultats de matching en arrière-plan.
 * Les trajets matchants sont référencés par ID — le consommateur résout
 * les objets complets via le store ou un fetch ciblé.
 *
 * Règle de matching : départ et arrivée dans un rayon de ~1-1.2 km du point spécifié.
 * Peuplé par POST /api/passenger/search (réutilisé, pas de route dédiée).
 */
export interface SurveyDestination {
  /** Identifiant unique */
  id: string;
  /** Nom du lieu de départ */
  departure: string;
  /** Nom du lieu d'arrivée */
  destination: string;
  /** Coordonnées GPS du départ [lng, lat] */
  departureCoords: [number, number];
  /** Coordonnées GPS de l'arrivée [lng, lat] */
  arrivalCoords: [number, number];
  /** IDs des trajets correspondants retournés par la dernière recherche serveur */
  tripIds: string[];
  /** IDs des conducteurs favoris parmi les trajets matchants */
  favoriteDriverIds: string[];
  /** Type de la surveillance */
  type: SurveyDestinationType;
  /** ISO date du dernier matching serveur (undefined = jamais rafraîchi) */
  lastRefreshedAt?: string;
}
