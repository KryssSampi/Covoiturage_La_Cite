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

  const TARGET_COUNT = 6;
  const SHOW_PARTIAL_AFTER_MS = 60_000;
  const TARGET_COUNT_DEADLINE_MS = 120_000;
  const MAX_SEARCH_MS = 360_000; // 6 minutes
  const RETRY_DELAY_MS = 5_000;

  async function runSearchWithTimeout(
    dep: [number, number],
    arr: [number, number],
    depLabel: string,
    arrLabel: string,
    onCancel?: () => boolean,
  ): Promise<void> {
    const startedAt = Date.now();
    let lastError: string | null = null;
    let bestResult: MapCircuit[] = [];
    let partialShown = false;

    while (Date.now() - startedAt < MAX_SEARCH_MS) {
      const elapsed = Date.now() - startedAt;
      if (onCancel?.()) return;
      try {
        const result = await fetchCircuits(dep, arr, depLabel, arrLabel);
        if (onCancel?.()) return;
        if (result.length > bestResult.length) {
          bestResult = result;
          if (bestResult.length > 0) {
            setCircuits(bestResult);
          }
        }

        if (bestResult.length >= TARGET_COUNT && elapsed <= TARGET_COUNT_DEADLINE_MS) {
          return;
        }

        if (!partialShown && elapsed >= SHOW_PARTIAL_AFTER_MS && bestResult.length > 0) {
          partialShown = true;
          setIsLoading(false);
        }

        if (elapsed >= TARGET_COUNT_DEADLINE_MS && bestResult.length > 0) {
          return;
        }
        lastError = "Aucun circuit trouvé entre ces deux points.";
      } catch (err) {
        lastError = err instanceof Error ? err.message : "Erreur lors de la recherche de circuits.";
      }

      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }

    if (bestResult.length > 0) {
      setCircuits(bestResult);
      return;
    }
    setCircuits([]);
    setError(lastError ?? "Aucun circuit trouvé entre ces deux points.");
  }

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

    let cancelled = false;
    try {
      await runSearchWithTimeout(dep, arr, depLabel, arrLabel, () => cancelled);
    } finally {
      if (!cancelled) setIsLoading(false);
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
    let cancelled = false;

    runSearchWithTimeout(
      initialDepartureCoords,
      initialArrivalCoords,
      departureLabel,
      arrivalLabel,
      () => cancelled,
    )
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Erreur OSRM circuits.")
      )
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
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
