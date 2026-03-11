// features/dashboard/hooks/useRecentDestinations.ts

import { useMemo } from "react";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";
import type { Destination } from "../types";

interface UseRecentDestinationsReturn {
  destinations: Destination[];
  isEmpty: boolean;
}

export function useRecentDestinations(): UseRecentDestinationsReturn {
  // Source unique : DashboardContext — les fixtures sont chargées une seule fois dans le provider
  // TODO: Remplacer par un appel API dans DashboardContext
  const { recentDestinations: raw } = useDashboardContext();

  const destinations = useMemo(
    () => [...raw].sort((a, b) => b.disponibility - a.disponibility),
    [raw]
  );

  return {
    destinations,
    isEmpty: destinations.length === 0,
  };
}
