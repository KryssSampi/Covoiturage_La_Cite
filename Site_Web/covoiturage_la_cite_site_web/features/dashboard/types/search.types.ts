/**
 * @file search.types.ts
 * @description Types et interfaces pour le formulaire de recherche SuperSearchSection.
 * Utilisé par SuperSearchSection, useSuperSearch et les pages de recherche/création de trajet.
 */

import { JSX } from "react";

// ─── Types géolocalisation ───────────────────────────────────────────────────

/**
 * Suggestion d'adresse retournée par getProposals() (service Nominatim/OSM).
 * Les coordonnées sont stockées pour le calcul d'itinéraire côté API.
 * Format : [longitude, latitude] (convention GeoJSON)
 */
export interface LocationSuggestion {
  label: string;
  coordinates: number[];
}

// ─── Types formulaire ────────────────────────────────────────────────────────

/**
 * Destination rapide affichée dans le menu déroulant des favoris de l'input arrivée.
 * Fournie en props depuis le dashboard (lieux favoris de l'utilisateur).
 */
export interface FavDestination {
  label: string;
  value: string;
  icon: JSX.Element;
  /** Coordonnées GPS du favori pour autofill */
  coordonnees?: { lat: number; lng: number };
}

/**
 * Paramètres de recherche construits à la soumission du formulaire.
 * Transmis à la page de résultats via le callback onSearch, puis à l'API.
 *
 * TODO: Utiliser ce type comme body de POST /api/trajets/search
 */
export interface SearchParams {
  /** Adresse de départ (texte libre ou sélection autocomplétion) */
  departureLocation: string;
  /** Adresse d'arrivée (texte libre ou sélection autocomplétion) */
  arrivalLocation: string;
  /** Date de départ sélectionnée (null si isNow === true) */
  departureDate: Date | null;
  /** Heure de départ "HH:mm" (heure actuelle si isNow === true) */
  departureTime: string | null;
  /** Date d'arrivée souhaitée (null si non renseignée) */
  arrivalDate: Date | null;
  /** Heure d'arrivée souhaitée "HH:mm" (null si non renseignée) */
  arrivalTime: string | null;
  /** true = départ immédiat, le champ date/heure est ignoré */
  isNow: boolean;
  /** "passenger" = rechercher un trajet / "driver" = planifier un trajet */
  searchType: "passenger" | "driver";
  /** Coordonnées GPS du départ [lng, lat] — undefined si non sélectionné via suggestion */
  departureCoords?: [number, number];
  /** Coordonnées GPS de l'arrivée [lng, lat] — undefined si non sélectionné via suggestion */
  arrivalCoords?: [number, number];
}

// ─── Props composant ─────────────────────────────────────────────────────────

/**
 * Props de SuperSearchSection.
 * Toutes optionnelles pour permettre l'usage dans le hero sans configuration.
 */
export interface SuperSearchSectionProps {
  /**
   * Callback déclenché à la soumission du formulaire.
   * TODO: Brancher sur POST /api/trajets/search (passager)
   *   OU  sur la page de création /trajets/create (conducteur)
   */
  onSearch?: (params: SearchParams) => void;
  /** Valeur initiale du champ de départ (ex: depuis FavoritesSection autofill) */
  defaultDeparture?: string;
  /** Valeur initiale du champ d'arrivée */
  defaultArrival?: string;
  /**
   * Liste des destinations rapides dans le menu déroulant de l'input arrivée.
   * TODO: Brancher sur GET /api/users/{userId}/favorites → mapper en FavDestination[]
   */
  favDestinations?: FavDestination[];
}
