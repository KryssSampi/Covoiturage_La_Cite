"use client";

import type { ReactNode } from "react";

import type { IndisponibilityDateRange } from "@/core/models/IndisponibilityModel";
import type { Language } from "@/core/state/app_state";
import type { PublishedTrip, Reservation } from "@/features/dashboard/types";
import { PlannerProvider } from "@/features/planner/context/PlannerContext";
import { IndisponibilityProvider } from "@/features/planner/context/IndisponibilityContext";
import { SearchBarProvider } from "@/features/planner/context/SearchBarContext";

interface PlannerFeatureProviderProps {
  children: ReactNode;
  lang: Language;
  isDriver: boolean;
  rides: (PublishedTrip | Reservation)[];
  indisponibilities?: IndisponibilityDateRange[];
  onSaveIndisponibilities?: (dates: IndisponibilityDateRange[]) => Promise<void>;
  onCancelTrip?: (tripId: string) => Promise<boolean>;
  onCancelReservation?: (reservationId: string, raison?: string) => Promise<boolean>;
  onStartReservation?: (reservationId: string) => Promise<string | null>;
  onStartTrip?: (tripId: string) => Promise<void>;
}

export function PlannerFeatureProvider({
  children,
  lang,
  isDriver,
  rides,
  indisponibilities,
  onSaveIndisponibilities,
  onCancelTrip,
  onCancelReservation,
  onStartReservation,
  onStartTrip,
}: PlannerFeatureProviderProps) {
  return (
    <PlannerProvider
      lang={lang}
      isDriver={isDriver}
      rides={rides}
      onCancelTrip={onCancelTrip}
      onCancelReservation={onCancelReservation}
      onStartReservation={onStartReservation}
      onStartTrip={onStartTrip}
    >
      <IndisponibilityProvider
        initialDates={indisponibilities}
        onSaveIndisponibilities={onSaveIndisponibilities}
      >
        <SearchBarProvider>{children}</SearchBarProvider>
      </IndisponibilityProvider>
    </PlannerProvider>
  );
}
