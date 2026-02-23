// features/dashboard/hooks/useUsualDestinations.ts

import { useMemo } from "react";
import { FIXTURES_USUAL_DESTINATIONS } from "@/tests/fixtures/dashboard/usualDestination.fixtures";
import type { Destination } from "../types";

interface UseUsualDestinationsReturn {
  destinations: Destination[];
  isEmpty: boolean;
}

export function useUsualDestinations(): UseUsualDestinationsReturn {
  // TODO: Remplacer FIXTURES_USUAL_DESTINATIONS par un appel API
  // const { data } = useQuery({ queryKey: ["usual-destinations"], queryFn: fetchUsualDestinations });

  const destinations = useMemo(
    () => [...FIXTURES_USUAL_DESTINATIONS].sort((a, b) => b.disponibility - a.disponibility),
    []
  );

  return {
    destinations,
    isEmpty: destinations.length === 0,
  };
}
