// features/dashboard/hooks/useRecentDestinations.ts

import { useMemo } from "react";
import { FIXTURES_RECENT_DESTINATIONS } from "@/tests/fixtures/dashboard/recentDestination.fixtures";
import type { Destination } from "../types";

interface UseRecentDestinationsReturn {
  destinations: Destination[];
  isEmpty: boolean;
}

export function useRecentDestinations(): UseRecentDestinationsReturn {
  // TODO: Remplacer FIXTURES_RECENT_DESTINATIONS par un appel API
  // const { data } = useQuery({ queryKey: ["recent-destinations"], queryFn: fetchRecentDestinations });

  const destinations = useMemo(
    () => [...FIXTURES_RECENT_DESTINATIONS].sort((a, b) => b.disponibility - a.disponibility),
    []
  );

  return {
    destinations,
    isEmpty: destinations.length === 0,
  };
}
