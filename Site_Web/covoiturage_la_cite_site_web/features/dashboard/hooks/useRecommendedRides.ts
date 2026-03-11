// features/dashboard/hooks/useRecommendedRides.ts

import { useMemo, useState } from "react";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";
import type { Trip } from "../types";

interface UseRecommendedRidesReturn {
  trips: Trip[];
  isEmpty: boolean;
  openPassengerLists: boolean[];
  togglePassengerList: (index: number) => void;
  closePassengerList: (index: number) => void;
}

export function useRecommendedRides(): UseRecommendedRidesReturn {
  // Source unique : DashboardContext — les fixtures sont chargées une seule fois dans le provider
  // TODO: Remplacer par un appel API dans DashboardContext
  const { recommendedTrips: rawTrips } = useDashboardContext();

  const trips = useMemo(
    () => [...rawTrips].sort((a, b) => a.date.localeCompare(b.date)),
    [rawTrips]
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
