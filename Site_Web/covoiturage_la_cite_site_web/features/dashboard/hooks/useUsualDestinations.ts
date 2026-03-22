// features/dashboard/hooks/useUsualDestinations.ts

import { useMemo } from "react";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";
import type { Destination } from "../types";
import type { SurveyDestination } from "../types/survey-destination.types";

interface UseUsualDestinationsReturn {
  destinations: Destination[];
  /** Map departure+destination → SurveyDestination pour le pré-matching */
  surveyMap: Map<string, SurveyDestination>;
  isEmpty: boolean;
}

export function useUsualDestinations(): UseUsualDestinationsReturn {
  // Source unique : DashboardContext — les fixtures sont chargées une seule fois dans le provider
  // TODO: Remplacer par un appel API dans DashboardContext
  const { usualDestinations: raw, surveyUsual } = useDashboardContext();

  const destinations = useMemo(
    () => [...raw].sort((a, b) => b.disponibility - a.disponibility),
    [raw]
  );

  // Associe chaque destination habituelle à son SurveyDestination par clé départ-arrivée
  const surveyMap = useMemo(() => {
    const map = new Map<string, SurveyDestination>();
    for (const s of surveyUsual) {
      map.set(`${s.departure}|${s.destination}`, s);
    }
    return map;
  }, [surveyUsual]);

  return {
    destinations,
    surveyMap,
    isEmpty: destinations.length === 0,
  };
}
