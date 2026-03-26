import { useMemo } from "react";
import { buildDashboardDestinationView } from "@/core/services/dashboard-selector.service";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";
import type { Destination } from "../types";
import type { SurveyDestination } from "../types/survey-destination.types";

interface UseRecentDestinationsReturn {
  destinations: Destination[];
  surveyMap: Map<string, SurveyDestination>;
  isEmpty: boolean;
}

export function useRecentDestinations(): UseRecentDestinationsReturn {
  const { recentDestinations, surveyRecent } = useDashboardContext();
  return useMemo(
    () => buildDashboardDestinationView(recentDestinations, surveyRecent),
    [recentDestinations, surveyRecent],
  );
}
