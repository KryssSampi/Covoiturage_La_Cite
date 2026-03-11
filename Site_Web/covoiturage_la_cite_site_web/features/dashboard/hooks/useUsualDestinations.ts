// features/dashboard/hooks/useUsualDestinations.ts

import { useMemo } from "react";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";
import type { Destination } from "../types";

interface UseUsualDestinationsReturn {
  destinations: Destination[];
  isEmpty: boolean;
}

export function useUsualDestinations(): UseUsualDestinationsReturn {
  // Source unique : DashboardContext — les fixtures sont chargées une seule fois dans le provider
  // TODO: Remplacer par un appel API dans DashboardContext
  const { usualDestinations: raw } = useDashboardContext();

  const destinations = useMemo(
    () => [...raw].sort((a, b) => b.disponibility - a.disponibility),
    [raw]
  );

  return {
    destinations,
    isEmpty: destinations.length === 0,
  };
}
