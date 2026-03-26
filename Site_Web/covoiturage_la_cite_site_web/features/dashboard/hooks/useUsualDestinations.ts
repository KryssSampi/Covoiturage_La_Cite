import { useMemo } from "react";
import { buildDashboardDestinationView } from "@/core/services/dashboard-selector.service";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";
import type { Destination } from "../types";
import type { SurveyDestination } from "../types/survey-destination.types";

interface UseUsualDestinationsReturn {
  destinations: Destination[];
  surveyMap: Map<string, SurveyDestination>;
  isEmpty: boolean;
}

export function useUsualDestinations(): UseUsualDestinationsReturn {
  const { usualDestinations, surveyUsual } = useDashboardContext();
  return useMemo(
    () => buildDashboardDestinationView(usualDestinations, surveyUsual),
    [usualDestinations, surveyUsual],
  );
}
