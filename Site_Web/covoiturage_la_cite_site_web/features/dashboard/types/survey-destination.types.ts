/**
 * @file survey-destination.types.ts
 * @description Types pour les destinations surveillées (récentes, habituelles, souhaitées).
 *
 * Un SurveyDestination contient les coordonnées de départ/arrivée,
 * la liste des trajets correspondants trouvés en arrière-plan,
 * et le nombre de conducteurs favoris parmi ces trajets.
 */

import type { Trip } from "./trip.types";

// ─── Type de surveillance ────────────────────────────────────────────────────

/** Type de destination surveillée */
export type SurveyDestinationType = "recent" | "usual" | "wishing";

// ─── Interface principale ────────────────────────────────────────────────────

/**
 * Destination surveillée avec résultats de matching en arrière-plan.
 * Les trajets matchants sont ceux dont le départ et l'arrivée sont
 * dans un rayon de 10-15 min de marche (~1-1.2 km) du point spécifié.
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
  /** Trajets correspondants trouvés par le background matching */
  matchingTrips: Trip[];
  /** Nombre de conducteurs favoris parmi les trajets matchants */
  favoriteDriverCount: number;
  /** Type de la surveillance */
  type: SurveyDestinationType;
}
