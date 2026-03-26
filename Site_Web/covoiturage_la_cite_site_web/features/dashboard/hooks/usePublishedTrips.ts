/**
 * @file usePublishedTrips.ts
 * @description Hook gerant la logique des trajets publies du conducteur.
 * Extrait de publised_trips_section.tsx.
 *
 * Responsabilites :
 * - Tri prioritaire des trajets
 * - Gestion de l'etat d'expansion de la liste de passagers par carte
 * - Formatage du statut (libelle + couleur du badge)
 *
 * @param trips Liste brute des trajets publies
 */

import { useMemo, useState } from "react";
import {
  PublishedTrip,
  PublishedTripStatus,
  PublishedTripCardModel,
} from "../types";
import { Language } from "@/core/state/app_state";
import {
  getPublishedTripStatusLabel,
  getPublishedTripStatusColor,
} from "@/shared/utils/status.utils";
import { organizeTrips } from "../utils/presentation-sort.utils";

interface UsePublishedTripsReturn {
  tripModels: PublishedTripCardModel[];
  isPassengerListOpens: { isPassengerListOpen: boolean }[];
  setIsPassengerListOpens: React.Dispatch<
    React.SetStateAction<{ isPassengerListOpen: boolean }[]>
  >;
  formatStatus: (status: PublishedTripStatus, lang: Language) => string;
  getStatusColor: (status: PublishedTripStatus) => string;
  hasInProgressTrip: boolean;
}

export function usePublishedTrips(
  trips: PublishedTrip[],
): UsePublishedTripsReturn {
  const tripModels = useMemo<PublishedTripCardModel[]>(
    () =>
      organizeTrips(trips).map((trip) => ({
        trip,
        isPassengerListOpen: false,
      })),
    [trips],
  );

  const [isPassengerListOpens, setIsPassengerListOpens] = useState(
    () => tripModels.map(() => ({ isPassengerListOpen: false })),
  );

  const [prevTripCount, setPrevTripCount] = useState(tripModels.length);
  if (tripModels.length !== prevTripCount) {
    setPrevTripCount(tripModels.length);
    setIsPassengerListOpens((prev) =>
      tripModels.map((_, i) => prev[i] ?? { isPassengerListOpen: false }),
    );
  }

  const formatStatus = (status: PublishedTripStatus, lang: Language): string =>
    getPublishedTripStatusLabel(status, lang);

  const getStatusColor = (status: PublishedTripStatus): string =>
    getPublishedTripStatusColor(status);

  const hasInProgressTrip = useMemo(
    () => trips.some((trip) => trip.status === PublishedTripStatus.InProgress),
    [trips],
  );

  return {
    tripModels,
    isPassengerListOpens,
    setIsPassengerListOpens,
    formatStatus,
    getStatusColor,
    hasInProgressTrip,
  };
}
