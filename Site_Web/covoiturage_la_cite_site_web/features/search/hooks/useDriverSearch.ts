/**
 * @file useDriverSearch.ts
 * @description Hook de recherche pour les conducteurs.
 *
 * Logique :
 *   1. Reçoit les coordonnées de départ/arrivée du conducteur
 *   2. Appelle fetchCircuits() du service OSRM (alternatives=true)
 *   3. Retourne 1 à 6 circuits MapCircuit triés par distance
 *   4. Gère l'état de chargement, d'erreur et l'index actif
 *
 * Le conducteur peut cliquer sur une MapCircuitCard pour activer
 * la polyline correspondante sur la carte.
 */

import { useState, useCallback, useEffect } from "react";
import { MapCircuit, DriverSortKey, SearchFilters } from "@/features/search/types/search.feature.types";
import { fetchCircuits } from "@/features/search/services/osrm.service";
import { filterAndSortCircuits } from "@/core/services/driver-circuit.service";

// Paramètres du hook
interface UseDriverSearchParams {
  /** Coordonnées de départ [lng, lat] — optionnelles (auto-fetch si présentes) */
  initialDepartureCoords?: [number, number];
  /** Coordonnées d'arrivée [lng, lat] — optionnelles */
  initialArrivalCoords?: [number, number];
  /** Label lisible du départ */
  departureLabel?: string;
  /** Label lisible de l'arrivée */
  arrivalLabel?: string;
}

// Résultat du hook
interface UseDriverSearchResult {
  /** Circuits retournés par OSRM, triés */
  circuits: MapCircuit[];
  /** Index du circuit actuellement sélectionné/affiché */
  activeIndex: number;
  /** Définit le circuit actif (ex.: clic sur MapCircuitCard) */
  setActiveIndex: (idx: number) => void;
  /** Lance une nouvelle recherche de circuits */
  search: (
    dep: [number, number],
    arr: [number, number],
    depLabel: string,
    arrLabel: string
  ) => Promise<void>;
  /** Circuits filtrés par durée/distance max, puis triés selon la clé choisie */
  filteredAndSortedCircuits: (key: DriverSortKey, filters?: Pick<SearchFilters, "maxDurationMinutes" | "maxDistanceKm">) => MapCircuit[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook de recherche de circuits pour le conducteur.
 *
 * Lance automatiquement la recherche OSRM si les coordonnées initiales sont fournies.
 */
export function useDriverSearch({
  initialDepartureCoords,
  initialArrivalCoords,
  departureLabel = "Départ",
  arrivalLabel   = "Arrivée",
}: UseDriverSearchParams = {}): UseDriverSearchResult {
  const [circuits,    setCircuits]    = useState<MapCircuit[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLoading,   setIsLoading]   = useState<boolean>(false);
  const [error,       setError]       = useState<string | null>(null);

  // Lancement de la recherche OSRM pour les circuits
  const search = useCallback(async (
    dep:      [number, number],
    arr:      [number, number],
    depLabel: string,
    arrLabel: string
  ) => {
    setIsLoading(true);
    setError(null);
    setActiveIndex(0);

    try {
      const result = await fetchCircuits(dep, arr, depLabel, arrLabel);
      setCircuits(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la recherche de circuits.");
      setCircuits([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filtrage par durée/distance, puis tri dynamique des circuits
  const filteredAndSortedCircuits = useCallback(
    (key: DriverSortKey, filters?: Pick<SearchFilters, "maxDurationMinutes" | "maxDistanceKm">): MapCircuit[] => {
      return filterAndSortCircuits(circuits, key, filters);
    },
    [circuits]
  );

  // Auto-déclenchement si des coordonnées initiales sont présentes
  // Lecture directe des props pour éviter la capture stale via useCallback
  useEffect(() => {
    if (!initialDepartureCoords || !initialArrivalCoords) return;

    setIsLoading(true);
    setError(null);
    setActiveIndex(0);

    fetchCircuits(
      initialDepartureCoords,
      initialArrivalCoords,
      departureLabel,
      arrivalLabel
    )
      .then((result) => setCircuits(result))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erreur OSRM circuits.")
      )
      .finally(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Dépendances vides — lecture directe des props initiales

  return {
    circuits,
    activeIndex,
    setActiveIndex,
    search,
    filteredAndSortedCircuits,
    isLoading,
    error,
  };
}
