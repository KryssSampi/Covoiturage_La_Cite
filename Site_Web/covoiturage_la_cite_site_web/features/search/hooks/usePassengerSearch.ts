/**
 * @file usePassengerSearch.ts
 * @description Hook de recherche passager — l'algorithme est désormais délégué
 * à un service core pour garder le hook concentré sur la mémorisation React.
 */

import { useMemo } from "react";
import { Trip } from "@/features/dashboard/types/trip.types";
import { SearchFilters, PassengerSortKey, MatchingScore } from "@/features/search/types/search.feature.types";
import { computePassengerSearchResult } from "@/core/services/passenger-search-client.service";

interface UsePassengerSearchParams {
  trips: Trip[];
  departureCoords: [number, number] | null;
  arrivalCoords: [number, number] | null;
  filters?: Partial<SearchFilters>;
  sortKey?: PassengerSortKey;
  desiredHour?: number;
}

interface UsePassengerSearchResult {
  filteredTrips: Trip[];
  totalCount: number;
  scores: Map<string, MatchingScore>;
}

export function usePassengerSearch({
  trips,
  departureCoords,
  arrivalCoords,
  filters = {},
  sortKey = "matching_desc",
  desiredHour,
}: UsePassengerSearchParams): UsePassengerSearchResult {
  const { filteredTrips, scores } = useMemo(
    () =>
      computePassengerSearchResult({
        trips,
        departureCoords,
        arrivalCoords,
        filters,
        sortKey,
        desiredHour,
      }),
    [
      trips,
      departureCoords,
      arrivalCoords,
      filters, // On utilise l'objet filters entier comme dépendance pour éviter les problèmes de mémorisation
      sortKey,
      desiredHour,
    ],
  );

  return { filteredTrips, totalCount: trips.length, scores };
}
