"use client";

/**
 * @file SearchBarContext.tsx  (v2)
 * @description Contexte de la barre de recherche du planner.
 *
 * Gère :
 * - L'affichage (slide-down) de la barre dans le Hero
 * - L'autocomplétion des lieux de départ / arrivée via Photon
 * - Les heures de départ et d'arrivée
 * - Le mode "recherche planner" : remplace SuperCalendar par RouteMapSearch compact
 *
 * `triggerPlannerSearch()` consolide toutes les valeurs saisies dans `plannerSearchValues`
 * et bascule `plannerSearchActive = true`, signalant aux pages de remplacer le calendrier.
 */

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { getProposals }             from "@/core/services/location.suggestion";
import {
  RouteMapInitialValues,
  LocationSuggestion,
} from "@/features/search/hooks/useRouteMap";

// ─── TYPE DU CONTEXTE ─────────────────────────────────────────────────────────

interface SearchBarContextType {
  // ── Affichage de la barre slide-down ────────────────────────────────────
  searchbarIsActive:    boolean;
  setSearchbarIsActive: (value: boolean) => void;
  OpenSearchBar:        () => void;
  CloseSearchBar:       () => void;
  resetSearchBar:       () => void;

  // ── Départ : état contrôlé + suggestions Photon ──────────────────────────
  departureValue:       string;
  departureSuggestions: LocationSuggestion[];
  departureCoords:      [number, number] | null;
  onDepartureChange:    (v: string) => Promise<void>;
  onDepartureSelect:    (s: LocationSuggestion) => void;
  departureinputRef:    React.RefObject<HTMLInputElement | null>;

  // ── Arrivée : état contrôlé + suggestions Photon ──────────────────────────
  arrivalValue:         string;
  arrivalSuggestions:   LocationSuggestion[];
  arrivalCoords:        [number, number] | null;
  onArrivalChange:      (v: string) => Promise<void>;
  onArrivalSelect:      (s: LocationSuggestion) => void;
  arrivalinputRef:      React.RefObject<HTMLInputElement | null>;

  // ── Date + heures de départ / arrivée ─────────────────────────────────────
  dateValue:             string;
  setDateValue:          (v: string) => void;
  departureTimeValue:    string;
  setDepartureTimeValue: (v: string) => void;
  arrivalTimeValue:      string;
  setArrivalTimeValue:   (v: string) => void;
  dateinputRef:          React.RefObject<HTMLInputElement | null>;
  timeinputRef:          React.RefObject<HTMLInputElement | null>;

  // ── Mode planner : remplace SuperCalendar par RouteMapSearch compact ─────
  plannerSearchActive:  boolean;
  plannerSearchValues:  RouteMapInitialValues | null;
  /** Entre en mode planner search IMMÉDIATEMENT (animation) et ouvre la searchbar */
  enterPlannerMode:     () => void;
  /** Consolide les valeurs saisies et met à jour la carte (plannerSearchActive est déjà true) */
  triggerPlannerSearch: () => void;
  /** Revient au mode calendrier (désactive la recherche planner) */
  exitPlannerSearch:    () => void;

  // ── Setters legacy (compat avec ancien code utilisant des refs) ───────────
  setDeparture: (value: string) => void;
  setArrival:   (value: string) => void;
  setDate:      (value: string) => void;
  setTime:      (value: string) => void;
}

// ─── CONTEXTE ─────────────────────────────────────────────────────────────────

const SearchBarContext = createContext<SearchBarContextType | undefined>(undefined);

// ─── PROVIDER ─────────────────────────────────────────────────────────────────

export function SearchBarProvider({ children }: { children: ReactNode }) {
  // ── Affichage de la barre ──────────────────────────────────────────────────
  const [searchbarIsActive, setSearchbarIsActive] = useState(false);

  // ── Départ ────────────────────────────────────────────────────────────────
  const [departureValue,       setDepartureValue]       = useState("");
  const [departureSuggestions, setDepartureSuggestions] = useState<LocationSuggestion[]>([]);
  const [departureCoords,      setDepartureCoords]      = useState<[number, number] | null>(null);

  // ── Arrivée ───────────────────────────────────────────────────────────────
  const [arrivalValue,         setArrivalValue]         = useState("");
  const [arrivalSuggestions,   setArrivalSuggestions]   = useState<LocationSuggestion[]>([]);
  const [arrivalCoords,        setArrivalCoords]        = useState<[number, number] | null>(null);

  // ── Date + heures ─────────────────────────────────────────────────────────
  const [dateValue,            setDateValue]            = useState("");
  const [departureTimeValue,   setDepartureTimeValue]   = useState("");
  const [arrivalTimeValue,     setArrivalTimeValue]     = useState("");

  // ── Mode planner recherche ────────────────────────────────────────────────
  const [plannerSearchActive, setPlannerSearchActive] = useState(false);
  const [plannerSearchValues, setPlannerSearchValues] = useState<RouteMapInitialValues | null>(null);

  // ── Refs DOM (focus externe + compat legacy) ──────────────────────────────
  const departureinputRef = useRef<HTMLInputElement>(null);
  const arrivalinputRef   = useRef<HTMLInputElement>(null);
  const dateinputRef      = useRef<HTMLInputElement>(null);
  const timeinputRef      = useRef<HTMLInputElement>(null);

  // ── Autocomplétion départ ──────────────────────────────────────────────────
  const onDepartureChange = useCallback(async (v: string) => {
    setDepartureValue(v);
    setDepartureCoords(null);
    const suggestions = await getProposals(v);
    setDepartureSuggestions(suggestions);
  }, []);

  const onDepartureSelect = useCallback((s: LocationSuggestion) => {
    setDepartureValue(s.label);
    setDepartureCoords(s.coordinates);
    setDepartureSuggestions([]);
  }, []);

  // ── Autocomplétion arrivée ─────────────────────────────────────────────────
  const onArrivalChange = useCallback(async (v: string) => {
    setArrivalValue(v);
    setArrivalCoords(null);
    const suggestions = await getProposals(v);
    setArrivalSuggestions(suggestions);
  }, []);

  const onArrivalSelect = useCallback((s: LocationSuggestion) => {
    setArrivalValue(s.label);
    setArrivalCoords(s.coordinates);
    setArrivalSuggestions([]);
  }, []);

  // ── Contrôle de la barre ───────────────────────────────────────────────────
  const OpenSearchBar  = () => setSearchbarIsActive(true);
  const CloseSearchBar = () => { setSearchbarIsActive(false); resetSearchBar(); };

  /** Réinitialise tous les champs sans sortir du mode planner search */
  const resetSearchBar = () => {
    setDepartureValue("");
    setDepartureCoords(null);
    setDepartureSuggestions([]);
    setArrivalValue("");
    setArrivalCoords(null);
    setArrivalSuggestions([]);
    setDateValue("");
    setDepartureTimeValue("");
    setArrivalTimeValue("");
  };

  // ── Mode planner recherche ─────────────────────────────────────────────────

  /**
   * Entre en mode planner search IMMÉDIATEMENT :
   * - plannerSearchActive = true  → déclenche l'animation calendrier → carte
   * - ouvre la searchbar         → l'utilisateur peut saisir ses critères
   * Appelé par le bouton "Planifier un trajet" et les TimeCells.
   */
  const enterPlannerMode = useCallback(() => {
    setPlannerSearchActive(true); // anime la sortie du calendrier
    setSearchbarIsActive(true);   // ouvre la barre pour saisir départ / arrivée
  }, []);

  /**
   * Consolide les valeurs saisies, ferme la barre slide-down,
   * et met à jour la carte (plannerSearchActive est déjà true).
   */
  const triggerPlannerSearch = useCallback(() => {
    setSearchbarIsActive(false);
    setPlannerSearchValues({
      departureLabel:  departureValue  || undefined,
      arrivalLabel:    arrivalValue    || undefined,
      departureCoords: departureCoords ?? undefined,
      arrivalCoords:   arrivalCoords   ?? undefined,
      departureTime:   departureTimeValue || undefined,
      arrivalTime:     arrivalTimeValue   || undefined,
    });
    setPlannerSearchActive(true);
  }, [departureValue, arrivalValue, departureCoords, arrivalCoords, departureTimeValue, arrivalTimeValue]);

  /** Revient au mode calendrier */
  const exitPlannerSearch = useCallback(() => {
    setPlannerSearchActive(false);
    setPlannerSearchValues(null);
  }, []);

  // ── Setters legacy ─────────────────────────────────────────────────────────
  const setDeparture = (value: string) => setDepartureValue(value);
  const setArrival   = (value: string) => setArrivalValue(value);
  const setDate      = (value: string) => {
    setDateValue(value);
    if (dateinputRef.current) dateinputRef.current.value = value;
  };
  const setTime = (value: string) => {
    setDepartureTimeValue(value);
    if (timeinputRef.current) timeinputRef.current.value = value;
  };

  const value: SearchBarContextType = {
    searchbarIsActive,
    setSearchbarIsActive,
    OpenSearchBar,
    CloseSearchBar,
    resetSearchBar,

    departureValue,
    departureSuggestions,
    departureCoords,
    onDepartureChange,
    onDepartureSelect,
    departureinputRef,

    arrivalValue,
    arrivalSuggestions,
    arrivalCoords,
    onArrivalChange,
    onArrivalSelect,
    arrivalinputRef,

    dateValue,
    setDateValue,
    departureTimeValue,
    setDepartureTimeValue,
    arrivalTimeValue,
    setArrivalTimeValue,
    dateinputRef,
    timeinputRef,

    plannerSearchActive,
    plannerSearchValues,
    enterPlannerMode,
    triggerPlannerSearch,
    exitPlannerSearch,

    setDeparture,
    setArrival,
    setDate,
    setTime,
  };

  return (
    <SearchBarContext.Provider value={value}>
      {children}
    </SearchBarContext.Provider>
  );
}

// ─── HOOK CONSOMMATEUR ────────────────────────────────────────────────────────

export function useHeroSearchBar(): SearchBarContextType {
  const context = useContext(SearchBarContext);
  if (!context) {
    throw new Error("useHeroSearchBar doit être utilisé à l'intérieur de SearchBarProvider");
  }
  return context;
}


// Interface pour le contexte de la searchbar
// ─── FIN DU FICHIER ──────────────────────────────────────────────────────────
