// features/dashboard/hooks/useRecommendedRides.ts

import { useMemo, useState } from "react";
import { FIXTURES_TRIPS } from "@/tests/fixtures/dashboard/trips.fixtures";
import type { Trip } from "../types";

interface UseRecommendedRidesReturn {
  trips: Trip[];
  isEmpty: boolean;
  openPassengerLists: boolean[];
  togglePassengerList: (index: number) => void;
  closePassengerList: (index: number) => void;
}

export function useRecommendedRides(): UseRecommendedRidesReturn {
  // TODO: Remplacer FIXTURES_TRIPS par un appel API
  // const { data } = useQuery({ queryKey: ["recommended-trips"], queryFn: fetchRecommendedTrips });

  const trips = useMemo(
    () => [...FIXTURES_TRIPS].sort((a, b) => a.date.localeCompare(b.date)),
    []
  );

  const [openPassengerLists, setOpenPassengerLists] = useState<boolean[]>(
    () => trips.map(() => false)
  );

  const togglePassengerList = (index: number) =>
    setOpenPassengerLists((prev) => prev.map((v, i) => (i === index ? !v : v)));

  const closePassengerList = (index: number) =>
    setOpenPassengerLists((prev) => prev.map((v, i) => (i === index ? false : v)));

  return {
    trips,
    isEmpty: trips.length === 0,
    openPassengerLists,
    togglePassengerList,
    closePassengerList,
  };
}
