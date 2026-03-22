/**
 * @file useRouteMap.ts
 * @description Hook gérant les deux inputs de localisation, les suggestions Photon
 * et la récupération du tracé de route via OSRM.
 *
 * Sources utilisées :
 *   - getProposals()  → Photon/OSM (autocomplétion, retourne [lng, lat])
 *   - OSRM public     → router.project-osrm.org (tracé polyline GeoJSON)
 *
 * Convention de coordonnées :
 *   - Photon / OSRM   → [lng, lat]
 *   - Leaflet          → [lat, lng]
 *   → La conversion est effectuée dans ce hook avant d'exposer les données.
 */

import { useState, useCallback, useRef, useEffect } from "react";
import type React from "react";
import { getProposals }                  from "@/core/services/location.suggestion";

// ─── TYPES ────────────────────────────────────────────────────────────────────

export interface LocationSuggestion {
  label:       string;
  /** [lng, lat] — format Photon brut */
  coordinates: [number, number];
}

export interface RouteResult {
  /** Polyline prête pour Leaflet : tableau de [lat, lng] */
  latLngs:    [number, number][];
  /** Durée estimée en secondes */
  duration:   number;
  /** Distance en mètres */
  distance:   number;
}

export interface UseRouteMapReturn {
  // ── Champ départ ──────────────────────────────────────────────────────────
  departureValue:       string;
  departureSuggestions: LocationSuggestion[];
  onDepartureChange:    (val: string) => Promise<void>;
  onDepartureSelect:    (s: LocationSuggestion) => void;
  departureCoords:      [number, number] | null; // [lng, lat]

  // ── Champ arrivée ─────────────────────────────────────────────────────────
  arrivalValue:         string;
  arrivalSuggestions:   LocationSuggestion[];
  onArrivalChange:      (val: string) => Promise<void>;
  onArrivalSelect:      (s: LocationSuggestion) => void;
  arrivalCoords:        [number, number] | null; // [lng, lat]

  // ── Heures de départ / arrivée ────────────────────────────────────────────
  departureDate:    string; // "yyyy-MM-dd" ou ""
  setDepartureDate: React.Dispatch<React.SetStateAction<string>>;
  departureTime:    string; // "HH:MM" ou ""
  setDepartureTime: React.Dispatch<React.SetStateAction<string>>;
  arrivalTime:      string; // "HH:MM" ou ""
  setArrivalTime:   React.Dispatch<React.SetStateAction<string>>;

  // ── Résultat route ────────────────────────────────────────────────────────
  route:                RouteResult | null;
  isLoading:            boolean;
  error:                string | null;

  // ── Actions ───────────────────────────────────────────────────────────────
  search: () => Promise<void>;

  // ── Refs DOM ─────────────────────────────────────────────────────────────
  departureRef: React.RefObject<HTMLInputElement | null>;
  arrivalRef:   React.RefObject<HTMLInputElement | null>;
}

// ─── VALEURS INITIALES ───────────────────────────────────────────────────────

/**
 * Valeurs pré-remplies transmises depuis la page (via query string du Hero).
 * Quand `departureCoords` ET `arrivalCoords` sont présents, la recherche OSRM
 * est déclenchée automatiquement au montage du composant.
 */
export interface RouteMapInitialValues {
  departureLabel?:  string;
  arrivalLabel?:    string;
  /** [lng, lat] — format Photon/OSRM */
  departureCoords?: [number, number];
  /** [lng, lat] — format Photon/OSRM */
  arrivalCoords?:   [number, number];
  /** Date de départ souhaitée — format "yyyy-MM-dd" */
  departureDate?:   string;
  /** Heure de départ souhaitée — format "HH:MM" */
  departureTime?:   string;
  /** Heure d'arrivée souhaitée — format "HH:MM" */
  arrivalTime?:     string;
}

// ─── CONSTANTE OSRM ──────────────────────────────────────────────────────────

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useRouteMap(initial?: RouteMapInitialValues): UseRouteMapReturn {
  // ── État départ ────────────────────────────────────────────
  const [departureValue,       setDepartureValue]       = useState(initial?.departureLabel ?? "");
  const [departureSuggestions, setDepartureSuggestions] = useState<LocationSuggestion[]>([]);
  const [departureCoords,      setDepartureCoords]      = useState<[number, number] | null>(initial?.departureCoords ?? null);

  // ── État arrivée ────────────────────────────────────────────
  const [arrivalValue,         setArrivalValue]         = useState(initial?.arrivalLabel ?? "");
  const [arrivalSuggestions,   setArrivalSuggestions]   = useState<LocationSuggestion[]>([]);
  const [arrivalCoords,        setArrivalCoords]        = useState<[number, number] | null>(initial?.arrivalCoords ?? null);

  // ── Heures de départ / arrivée ─────────────────────────────────────────────
  const [departureDate,        setDepartureDate]        = useState(initial?.departureDate ?? "");
  const [departureTime,        setDepartureTime]        = useState(initial?.departureTime ?? "");
  const [arrivalTime,          setArrivalTime]          = useState(initial?.arrivalTime   ?? "");

  // ── Résultat route ─────────────────────────────────────────────────────────
  const [route,     setRoute]     = useState<RouteResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // ── Refs DOM ───────────────────────────────────────────────────────────────
  const departureRef = useRef<HTMLInputElement | null>(null);
  const arrivalRef   = useRef<HTMLInputElement | null>(null);

  // ─── Autocomplétion départ ────────────────────────────────────────────────

  const onDepartureChange = useCallback(async (val: string) => {
    setDepartureValue(val);
    // Réinitialise les coordonnées si l'utilisateur modifie le texte manuellement
    setDepartureCoords(null);
    const suggestions = await getProposals(val);
    setDepartureSuggestions(suggestions);
  }, []);

  const onDepartureSelect = useCallback((s: LocationSuggestion) => {
    setDepartureValue(s.label);
    setDepartureCoords(s.coordinates);
    // Ferme la liste de suggestions
    setDepartureSuggestions([]);
  }, []);

  // ─── Autocomplétion arrivée ───────────────────────────────────────────────

  const onArrivalChange = useCallback(async (val: string) => {
    setArrivalValue(val);
    setArrivalCoords(null);
    const suggestions = await getProposals(val);
    setArrivalSuggestions(suggestions);
  }, []);

  const onArrivalSelect = useCallback((s: LocationSuggestion) => {
    setArrivalValue(s.label);
    setArrivalCoords(s.coordinates);
    setArrivalSuggestions([]);
  }, []);

  // ─── Recherche de route OSRM ──────────────────────────────────────────────

  const search = useCallback(async () => {
    // Validation : les deux coordonnées doivent être connues
    if (!departureCoords || !arrivalCoords) {
      setError("Veuillez sélectionner un lieu de départ et d'arrivée dans les suggestions.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setRoute(null);

    try {
      // OSRM attend : {lng},{lat};{lng},{lat}
      const [dLng, dLat] = departureCoords;
      const [aLng, aLat] = arrivalCoords;

      const url = `${OSRM_BASE}/${dLng},${dLat};${aLng},${aLat}?overview=full&geometries=geojson`;
      const res = await fetch(url);

      if (!res.ok) throw new Error(`OSRM a retourné une erreur : ${res.status}`);

      const data = await res.json();

      if (!data.routes?.length) {
        throw new Error("Aucune route trouvée entre ces deux points.");
      }

      const osrmRoute = data.routes[0];

      // Conversion OSRM [lng, lat] → Leaflet [lat, lng]
      const latLngs: [number, number][] = osrmRoute.geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );

      setRoute({
        latLngs,
        duration: osrmRoute.duration,
        distance: osrmRoute.distance,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la récupération de la route.");
    } finally {
      setIsLoading(false);
    }
  }, [departureCoords, arrivalCoords]);

  // ── Auto-déclenchement OSRM si des coordonnées initiales sont fournies ──────
  // On appelle OSRM DIRECTEMENT depuis `initial` (pas via la closure `search`)
  // pour éviter tout problème de capture stale avec useCallback([deps]).
  useEffect(() => {
    const dCoords = initial?.departureCoords;
    const aCoords = initial?.arrivalCoords;
    if (!dCoords || !aCoords) return;

    setIsLoading(true);
    setError(null);

    const [dLng, dLat] = dCoords;
    const [aLng, aLat] = aCoords;
    const url = `${OSRM_BASE}/${dLng},${dLat};${aLng},${aLat}?overview=full&geometries=geojson`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`OSRM erreur : ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!data.routes?.length) throw new Error("Aucune route trouvée entre ces deux points.");
        const osrmRoute = data.routes[0];
        const latLngs: [number, number][] = osrmRoute.geometry.coordinates.map(
          ([lng, lat]: [number, number]) => [lat, lng] as [number, number]
        );
        setRoute({ latLngs, duration: osrmRoute.duration, distance: osrmRoute.distance });
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur OSRM."))
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dépendances vides — on lit `initial` directement, pas via closure d'état

  return {
    departureValue,
    departureSuggestions,
    onDepartureChange,
    onDepartureSelect,
    departureCoords,

    arrivalValue,
    arrivalSuggestions,
    onArrivalChange,
    onArrivalSelect,
    arrivalCoords,

    departureTime,
    setDepartureTime,
    departureDate,
    setDepartureDate,
    arrivalTime,
    setArrivalTime,

    route,
    isLoading,
    error,

    search,

    departureRef,
    arrivalRef,
  };
}
