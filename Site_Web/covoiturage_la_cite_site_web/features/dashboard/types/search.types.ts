/**
 * @file search.types.ts
 * @description Types et interfaces pour le formulaire de recherche SuperSearchSection.
 * Utilisé par SuperSearchSection, useSuperSearch et les pages de recherche/création de trajet.
 */

import type React from "react";
import { type JSX, type RefObject, type ChangeEvent } from "react";

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

// ─── Retour du hook useSuperSearch ───────────────────────────────────────────

export interface UseSuperSearchReturn {
  // ── Champs de localisation ──────────────────────────────────────────────
  departureLocation: string;
  arrivalLocation: string;
  setDepartureLocation: (v: string) => void;
  setArrivalLocation: (v: string) => void;

  // ── Erreur de localisation du départ ────────────────────────────────────
  departureError: string | null;

  // ── Erreur de validation du formulaire (inline, remplace les alert()) ───
  formError: string | null;

  // ── Suggestions d'autocomplétion ────────────────────────────────────────
  departureSuggestions: LocationSuggestion[];
  arrivalSuggestions: LocationSuggestion[];
  handleDepartureInputChange: (val: string) => Promise<void>;
  handleArrivalInputChange: (val: string) => Promise<void>;
  selectDepartureSuggestion: (suggestion: LocationSuggestion) => void;
  selectArrivalSuggestion: (suggestion: LocationSuggestion) => void;

  // ── Géolocalisation ─────────────────────────────────────────────────────
  isCurrentLocationLoading: boolean;
  handleGetCurrentLocation: () => void;

  // ── Mode "Maintenant" vs "Planifié" ─────────────────────────────────────
  departIsNotNow: boolean;
  setDepartIsNotNow: (v: boolean) => void;

  // ── DateTimePicker : date active ────────────────────────────────────────
  isStartPickerOpen: boolean;
  switchToStartPicker: () => void;
  switchToArrivalPicker: () => void;
  activeDate: Date;
  activeTime: string;
  dateLabel: string;
  today: Date;
  moveNextDay: () => void;
  movePrevDay: () => void;
  handleDateChange: (e: ChangeEvent<HTMLInputElement>) => void;

  // ── DateTimePicker : heure active ────────────────────────────────────────
  moveTimeUp: () => void;
  moveTimeDown: () => void;
  setActiveTime: (time: string) => void;

  // ── Refs DOM ────────────────────────────────────────────────────────────
  dateInputRef: RefObject<HTMLInputElement | null>;
  timeInputRef: RefObject<HTMLInputElement | null>;
  departureRef: RefObject<HTMLTextAreaElement | null>;
  arrivalRef: RefObject<HTMLTextAreaElement | null>;

  // ── Menu favoris (dropdown arrivée) ─────────────────────────────────────
  isFavMenuOpen: boolean;
  setIsFavMenuOpen: (v: boolean) => void;

  // ── Coordonnées GPS arrivée ─────────────────────────────────────────────
  setArrivalCoords: (coords: [number, number] | undefined) => void;

  // ── Soumission ──────────────────────────────────────────────────────────
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
}
