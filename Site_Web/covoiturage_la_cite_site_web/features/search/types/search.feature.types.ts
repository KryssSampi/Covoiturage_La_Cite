/**
 * @file search.feature.types.ts  (v2)
 * @description Types/interfaces du feature Search — enrichis avec matching score.
 */

// ─── RÔLE ─────────────────────────────────────────────────────────────────────

export type SearchRole = "passenger" | "driver";

// ─── CIRCUIT OSRM (conducteur) ────────────────────────────────────────────────

export interface MapCircuit {
  routeIndex:      number;
  latLngs:         [number, number][];
  duration:        number;   // secondes
  distance:        number;   // mètres
  summary:         string;
  departureCoords: [number, number]; // [lng, lat]
  arrivalCoords:   [number, number];
  departureLabel:  string;
  arrivalLabel:    string;
}

// ─── SCORE DE MATCHING (passager) ─────────────────────────────────────────────

/**
 * Score de compatibilité calculé pour chaque trajet.
 * 5 critères pondérés → score global 0–100.
 */
export interface MatchingScore {
  /** Score global 0–100 */
  total: number;
  /** Proximité géographique départ (0–30) */
  geoDepart: number;
  /** Proximité géographique arrivée (0–30) */
  geoArrivee: number;
  /** Correspondance horaire (0–20) */
  horaire: number;
  /** Note du conducteur (0–10) */
  noteConducteur: number;
  /** Places disponibles (0–10) */
  places: number;
}

// ─── FILTRES DE RECHERCHE ─────────────────────────────────────────────────────

export interface SearchFilters {
  /** Rayon (m) autour du départ (défaut 300 m) */
  departureRadiusMeters: number;
  /** Rayon (m) autour de l'arrivée (défaut 300 m) */
  arrivalRadiusMeters:   number;

  // Passager
  maxPrice?:          number;
  minSeatsAvailable?: number;
  statuses?:          string[];
  driverName?:        string;

  // Conducteur
  maxDurationMinutes?: number;
  maxDistanceKm?:      number;
}

export const DEFAULT_SEARCH_FILTERS: SearchFilters = {
  departureRadiusMeters: 500,
  arrivalRadiusMeters:   500,
};

// ─── OPTIONS DE TRI ───────────────────────────────────────────────────────────

export type PassengerSortKey = "matching_desc" | "price_asc" | "price_desc" | "departure_asc" | "seats_desc";
export type DriverSortKey    = "distance_asc" | "duration_asc" | "default";
export type SortKey          = PassengerSortKey | DriverSortKey;

export interface SortOption<K extends SortKey = SortKey> {
  key:   K;
  label: string;
}

export const PASSENGER_SORT_OPTIONS: SortOption<PassengerSortKey>[] = [
  { key: "matching_desc",  label: "Meilleur match"      },
  { key: "price_asc",      label: "Prix croissant"       },
  { key: "price_desc",     label: "Prix décroissant"     },
  { key: "departure_asc",  label: "Départ le plus tôt"   },
  { key: "seats_desc",     label: "Plus de places"       },
];

export const DRIVER_SORT_OPTIONS: SortOption<DriverSortKey>[] = [
  { key: "default",      label: "Recommandé"        },
  { key: "distance_asc", label: "Distance minimale"  },
  { key: "duration_asc", label: "Durée minimale"     },
];
