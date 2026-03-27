/**
 * @file useSuperSearch.ts
 * @description Hook centralisant toute la logique du formulaire SuperSearchSection.
 * Extrait de supersearchsection.tsx pour séparer logique et présentation.
 *
 * Responsabilités :
 * - État des champs départ / arrivée + suggestions d'autocomplétion (via getProposals)
 * - Géolocalisation navigateur → reverse geocoding (via getAddressFromCoords)
 * - Gestion du DateTimePicker : date active, heure active, navigation jour par jour
 * - Gestion du mode "Maintenant" vs "Planifié"
 * - Toggle Départ ↔ Arrivée dans le DateTimePicker
 * - Écoute du CustomEvent "gero-search-section-autofill" (depuis FavoritesSection)
 * - Construction et soumission des SearchParams
 *
 * @param defaultDeparture Valeur initiale du champ départ
 * @param defaultArrival Valeur initiale du champ arrivée
 * @param onSearch Callback appelé à la soumission avec les paramètres construits
 */

import { useCallback, useEffect, useRef, useState } from "react";
import {
  format,
  addDays,
  subDays,
  startOfDay,
  isBefore,
} from "date-fns";

import { Language, useAppState } from "@/core/state/app_state";
import { getProposals } from "@/core/services/location.suggestion";
import { getAddressFromCoords } from "@/core/services/getlocation.current";

import { LocationSuggestion, SearchParams, UseSuperSearchReturn } from "../types/search.types";
import { timeToMinutes, minutesToTime, getDateLabel, GEOLOCATION_ERROR_MESSAGES } from "../utils/supersearch.utils";

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useSuperSearch(
  defaultDeparture: string,
  defaultArrival: string,
  onSearch?: (params: SearchParams) => void,
): UseSuperSearchReturn {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const isDriver = appState.userConnected?.role === "driver";

  // ── Champs de localisation ────────────────────────────────────────────────
  const [departureLocation, setDepartureLocation] = useState(defaultDeparture);
  const [arrivalLocation, setArrivalLocation] = useState(defaultArrival);

  // ── Suggestions d'autocomplétion ──────────────────────────────────────────
  const [departureSuggestions, setDepartureSuggestions] = useState<LocationSuggestion[]>([]);
  const [arrivalSuggestions, setArrivalSuggestions] = useState<LocationSuggestion[]>([]);

  // ── Coordonnées GPS sélectionnées (remplies quand l'utilisateur choisit une suggestion) ─
  const [departureCoords, setDepartureCoords] = useState<[number, number] | undefined>(undefined);
  const [arrivalCoords, setArrivalCoords]     = useState<[number, number] | undefined>(undefined);

  // ── Géolocalisation ───────────────────────────────────────────────────────
  const [isCurrentLocationLoading, setIsCurrentLocationLoading] = useState(false);
  // État pour l'erreur de localisation du départ
  const [departureError, setDepartureError] = useState<string | null>(null);

  // Erreur de validation du formulaire (remplace les alert())
  const [formError, setFormError] = useState<string | null>(null);

  // ── Mode "Maintenant" vs "Planifié" ──────────────────────────────────────
  const [departIsNotNow, setDepartIsNotNow] = useState(false);

  // ── DateTimePicker ────────────────────────────────────────────────────────
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(true);
  const [isFavMenuOpen, setIsFavMenuOpen] = useState(false);

  const [departureDate, setDepartureDate] = useState<Date | null>(new Date());
  const [departureTime, setDepartureTime] = useState<string | null>(
    format(new Date(), "HH:mm"),
  );
  const [arrivalDate, setArrivalDate] = useState<Date | null>(new Date());
  const [arrivalTime, setArrivalTime] = useState<string | null>(
    format(new Date(), "HH:mm"),
  );

  // ── Refs DOM ──────────────────────────────────────────────────────────────
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const departureRef = useRef<HTMLTextAreaElement>(null);
  const arrivalRef = useRef<HTMLTextAreaElement>(null);

  const today = startOfDay(new Date());

  // ── Écoute de l'autofill depuis FavoritesSection ──────────────────────────
  // FavoritesSection dispatch "gero-search-section-autofill" quand l'utilisateur
  // clique sur un favori. Ce hook écoute cet événement et remplit le champ arrivée.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ value: string; coordonnees?: { lat: number; lng: number } }>).detail;
      if (!detail) return;
      const { value, coordonnees } = typeof detail === 'string'
        ? { value: detail, coordonnees: undefined }
        : detail;
      if (value) setArrivalLocation(value);
      if (coordonnees) setArrivalCoords([coordonnees.lng, coordonnees.lat]);
    };
    window.addEventListener("gero-search-section-autofill", handler);
    return () => window.removeEventListener("gero-search-section-autofill", handler);
  }, []);

  // ── Helpers date/heure actives (départ ou arrivée selon le picker ouvert) ─

  const activeDate = isStartPickerOpen
    ? (departureDate ?? new Date())
    : (arrivalDate ?? new Date());

  const activeTime = isStartPickerOpen
    ? (departureTime ?? format(new Date(), "HH:mm"))
    : (arrivalTime ?? format(new Date(), "HH:mm"));

  const setActiveDate = (date: Date) => {
    if (isStartPickerOpen) setDepartureDate(date);
    else setArrivalDate(date);
  };

  const setActiveTime = (time: string) => {
    if (isStartPickerOpen) setDepartureTime(time);
    else setArrivalTime(time);
  };

  // ── Label date localisé (logique pure extraite) ───────────────────────────
  const dateLabel = activeDate ? getDateLabel(activeDate, isFR) : "";

  // ── Navigation date ───────────────────────────────────────────────────────
  const moveNextDay = () => {
    setActiveDate(addDays(activeDate, 1));
  };

  const movePrevDay = () => {
    const prev = subDays(activeDate, 1);
    if (!isBefore(prev, today)) setActiveDate(prev);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.value) {
      const newDate = new Date(e.target.value);
      if (!isBefore(newDate, today)) setActiveDate(newDate);
    } else {
      setActiveDate(new Date());
    }
  };

  // ── Navigation heure (pas de 5 minutes, conversions importées) ────────────
  const moveTimeUp = () => {
    setActiveTime(minutesToTime(timeToMinutes(activeTime) + 5));
  };

  const moveTimeDown = () => {
    setActiveTime(minutesToTime(Math.max(0, timeToMinutes(activeTime) - 5)));
  };

  // ── Toggle Départ ↔ Arrivée ───────────────────────────────────────────────
  const switchToStartPicker = () => {
    setIsStartPickerOpen(true);
    setArrivalTime(null);
    setArrivalDate(null);
  };

  const switchToArrivalPicker = () => {
    setIsStartPickerOpen(false);
    // La date et l'heure de départ restent remplies (jamais null) — seule l'arrivée peut être nulle
  };

  // ── Autocomplétion ────────────────────────────────────────────────────────

  /**
   * Déclenche une requête d'autocomplétion à partir de 3 caractères.
   * TODO: Remplacer getProposals par un appel à l'API interne si disponible.
   * GET /api/locations/suggestions?q={val}
   */
  const handleDepartureInputChange = async (val: string) => {
    setDepartureLocation(val);
    if (val.length > 2) {
      const results = await getProposals(val);
      setDepartureSuggestions(results);
    } else {
      setDepartureSuggestions([]);
    }
  };

  const handleArrivalInputChange = async (val: string) => {
    setArrivalLocation(val);
    if (val.length > 2) {
      const results = await getProposals(val);
      setArrivalSuggestions(results);
    } else {
      setArrivalSuggestions([]);
    }
  };

  /**
   * Sélectionne une suggestion de départ.
   * Les coordonnées sont disponibles dans suggestion.coordinates pour le calcul
   * d'itinéraire côté API (format [longitude, latitude] GeoJSON).
   * TODO: Stocker departureCoords dans un état séparé pour POST /api/trajets/search
   */
  const selectDepartureSuggestion = (suggestion: LocationSuggestion) => {
    setDepartureLocation(suggestion.label);
    setDepartureSuggestions([]);
    // Stocke les coordonnées [lng, lat] pour les transmettre à la page de recherche
    setDepartureCoords(suggestion.coordinates as [number, number]);
  };

  /**
   * Sélectionne une suggestion d'arrivée.
   */
  const selectArrivalSuggestion = (suggestion: LocationSuggestion) => {
    setArrivalLocation(suggestion.label);
    setArrivalSuggestions([]);
    // Stocke les coordonnées [lng, lat] pour les transmettre à la page de recherche
    setArrivalCoords(suggestion.coordinates as [number, number]);
  };

  // ── Géolocalisation ───────────────────────────────────────────────────────

  // Ancienne version de handleGetCurrentLocation supprimée pour éviter la redéclaration.
  /**
 * @snippet handleGetCurrentLocation — à intégrer dans useSuperSearch.ts
 *
 * Gère la géolocalisation + reverse geocoding avec fallback UI complet.
 * Remplace l'ancienne version qui exposait les coordonnées brutes en cas d'échec.
 *
 * Comportement :
 * - Succès geocoding  → adresse lisible dans le champ départ
 * - Échec geocoding   → message d'erreur clair, champ vide (jamais de "45.4215, -75.6972")
 * - Refus géoloc      → message d'erreur clair
 * - Timeout géoloc    → message d'erreur clair (timeout 10s, plus long que les 5s d'avant)
 */

const handleGetCurrentLocation = useCallback(() => {
  if (!navigator.geolocation) {
    // Navigateur ne supporte pas la géolocalisation
    setDepartureError(
      isFR
        ? "La géolocalisation n'est pas supportée par votre navigateur."
        : "Geolocation is not supported by your browser.",
    );
    return;
  }

  setIsCurrentLocationLoading(true);
  setDepartureError(null); // Réinitialise l'erreur précédente

  navigator.geolocation.getCurrentPosition(
    // ── Succès géolocalisation ──────────────────────────────────────────────
    async ({ coords: { latitude, longitude } }) => {
      const address = await getAddressFromCoords(latitude, longitude);

      if (address) {
        // ✅ Adresse obtenue → on remplit le champ ET on stocke les coords [lng, lat]
        setDepartureLocation(address);
        setDepartureCoords([longitude, latitude]); // [lng, lat] convention app
      } else {
        // ❌ Geocoding échoué après tous les retries
        // On NE met PAS les coordonnées brutes — on informe l'utilisateur
        setDepartureError(
          isFR
            ? "Impossible de déterminer votre adresse. Veuillez la saisir manuellement."
            : "Unable to determine your address. Please enter it manually.",
        );
        // Le champ reste vide — l'utilisateur tape lui-même
        setDepartureLocation("");
        setDepartureCoords(undefined); // pas de coords si adresse indisponible
      }

      setIsCurrentLocationLoading(false);
    },

    // ── Échec géolocalisation (refus ou timeout) ────────────────────────────
    (error) => {
      const msg = GEOLOCATION_ERROR_MESSAGES[error.code] ?? {
        fr: "Erreur de localisation inconnue.",
        en: "Unknown location error.",
      };

      setDepartureError(isFR ? msg.fr : msg.en);
      setIsCurrentLocationLoading(false);
    },

    // ── Options géolocalisation ─────────────────────────────────────────────
    {
      enableHighAccuracy: true,
      timeout: 10000,     // 10s — plus généreux que les 5s d'avant
      maximumAge: 30000,  // Accepte une position en cache de moins de 30s
    },
  );
}, [isFR, setDepartureLocation, setIsCurrentLocationLoading]);



  // ── Soumission ────────────────────────────────────────────────────────────

  /**
   * Valide les champs obligatoires, construit un objet SearchParams complet
   * et l'envoie au callback onSearch.
   *
   * Si l'utilisateur n'a pas sélectionné de suggestion (coords absentes), on tente
   * un appel getProposals au moment du submit et on prend le top-1 comme fallback.
   * Date et heure de départ sont toujours remplies (jamais null) — Date.now() par défaut.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!departureLocation.trim()) {
      setFormError(isFR ? "Veuillez entrer un lieu de départ" : "Please enter a departure location");
      return;
    }
    if (!arrivalLocation.trim()) {
      setFormError(isFR ? "Veuillez entrer une destination" : "Please enter a destination");
      return;
    }

    // Fallback top-1 : si l'utilisateur n'a pas sélectionné de suggestion pour le départ
    let resolvedDepartureCoords = departureCoords;
    if (!resolvedDepartureCoords) {
      const depResults = await getProposals(departureLocation.trim());
      if (depResults.length > 0) resolvedDepartureCoords = depResults[0].coordinates as [number, number];
    }

    // Fallback top-1 : si l'utilisateur n'a pas sélectionné de suggestion pour l'arrivée
    let resolvedArrivalCoords = arrivalCoords;
    if (!resolvedArrivalCoords) {
      const arrResults = await getProposals(arrivalLocation.trim());
      if (arrResults.length > 0) resolvedArrivalCoords = arrResults[0].coordinates as [number, number];
    }

    // Date et heure de départ toujours remplies (Date.now si non modifiées)
    const now = new Date();
    const params: SearchParams = {
      departureLocation: departureLocation.trim(),
      arrivalLocation: arrivalLocation.trim(),
      departureDate: departureDate ?? now,
      departureTime: departIsNotNow ? (departureTime ?? format(now, "HH:mm")) : format(now, "HH:mm"),
      arrivalDate,
      arrivalTime: departIsNotNow ? arrivalTime : null,
      isNow: !departIsNotNow,
      searchType: isDriver ? "driver" : "passenger",
      departureCoords: resolvedDepartureCoords,
      arrivalCoords: resolvedArrivalCoords,
    };

    onSearch?.(params);
  };

  return {
    // Localisation
    departureLocation,
    arrivalLocation,
    setDepartureLocation,
    setArrivalLocation,
    // Suggestions
    departureSuggestions,
    arrivalSuggestions,
    handleDepartureInputChange,
    handleArrivalInputChange,
    selectDepartureSuggestion,
    selectArrivalSuggestion,
    // Géolocalisation
    isCurrentLocationLoading,
    handleGetCurrentLocation,
    departureError,
    formError,
    // Mode Maintenant / Planifié
    departIsNotNow,
    setDepartIsNotNow,
    // DateTimePicker
    isStartPickerOpen,
    switchToStartPicker,
    switchToArrivalPicker,
    activeDate,
    activeTime,
    dateLabel,
    today,
    moveNextDay,
    movePrevDay,
    handleDateChange,
    // Heure
    moveTimeUp,
    moveTimeDown,
    setActiveTime,
    // Refs
    dateInputRef,
    timeInputRef,
    departureRef,
    arrivalRef,
    // Menu favoris
    isFavMenuOpen,
    setIsFavMenuOpen,
    // Coordonnées GPS arrivée
    setArrivalCoords,
    // Soumission
    handleSubmit,
  };
}
