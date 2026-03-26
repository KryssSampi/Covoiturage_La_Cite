/**
 * @file search.feature.types.ts  (v2)
 * @description Types/interfaces du feature Search — enrichis avec matching score.
 */

import { Trip } from "@/features/dashboard/types/trip.types";

// ─── RÔLE ─────────────────────────────────────────────────────────────────────

export type SearchRole = "passenger" | "driver";

// ─── CIRCUIT OSRM (conducteur) ────────────────────────────────────────────────

export interface MapCircuit {
  routeIndex:      number;
  latLngs:         [number, number][];
  waypointCoords?: [number, number][];
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

export type BlockedTripReason =
  | "trip_not_published"
  | "trip_full"
  | "already_passenger"
  | "geo_departure_too_far"
  | "geo_arrival_too_far"
  | "payment_incompatible"
  | "goscore_too_low"
  | "bad_past_experience"
  | "passenger_unreliable";

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
  departureRadiusMeters: 1000,
  arrivalRadiusMeters:   1000,
};

// ─── OPTIONS DE TRI ───────────────────────────────────────────────────────────

export type PassengerSortKey = "matching_desc" | "price_asc" | "price_desc" | "departure_asc" | "seats_desc";
export type DriverSortKey    = "distance_asc" | "duration_asc" | "default";
export type SortKey          = PassengerSortKey | DriverSortKey;

export interface SortOption<K extends SortKey = SortKey> {
  key:   K;
  label: string;
}

export const getPASSENGER_SORT_OPTIONS = (isFR: boolean): SortOption<PassengerSortKey>[] => [
  { key: "matching_desc",  label: isFR ? "Meilleur match"    : "Best match"          },
  { key: "price_asc",      label: isFR ? "Prix croissant"    : "Price ascending"     },
  { key: "price_desc",     label: isFR ? "Prix décroissant"  : "Price descending"    },
  { key: "departure_asc",  label: isFR ? "Départ le plus tôt": "Earliest departure"  },
  { key: "seats_desc",     label: isFR ? "Plus de places"    : "Most seats"          },
];

export const getDRIVER_SORT_OPTIONS = (isFR: boolean): SortOption<DriverSortKey>[] => [
  { key: "default",      label: isFR ? "Recommandé"       : "Recommended"       },
  { key: "distance_asc", label: isFR ? "Distance minimale": "Shortest distance"  },
  { key: "duration_asc", label: isFR ? "Durée minimale"   : "Shortest duration"  },
];

// ─── TRIP AVEC COORDONNÉES ─────────────────────────────────────────────────────

/**
 * Extension de Trip avec coordonnées géographiques optionnelles.
 * Version fusionnée (superset) des deux définitions locales présentes
 * dans useMatchingScore et usePassengerSearch.
 */
export type TripWithCoords = Trip & {
  departureCoords?: [number, number]; // [lng, lat]
  arrivalCoords?:   [number, number]; // [lng, lat]
  status?:          string;           // Champ optionnel pour le filtre statuses
  blockedReason?:   BlockedTripReason;
};
