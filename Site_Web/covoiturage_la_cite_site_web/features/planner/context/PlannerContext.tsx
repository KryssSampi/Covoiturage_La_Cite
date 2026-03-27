"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

import type { Language } from "@/core/state/app_state";
import type { PublishedTrip, Reservation } from "@/features/dashboard/types";

interface PlannerContextType {
  currentDay: Date;
  setCurrentDay: (day: Date) => void;
  showAll: boolean;
  setShowAll: (value: boolean) => void;
  lang: Language;
  isDriver: boolean;
  rides: (PublishedTrip | Reservation)[];
  onCancelTrip?: (tripId: string) => Promise<boolean>;
  onCancelReservation?: (reservationId: string, raison?: string) => Promise<boolean>;
  onStartReservation?: (reservationId: string) => Promise<string | null>;
  onStartTrip?: (tripId: string) => Promise<void>;
}

interface PlannerProviderProps {
  children: ReactNode;
  lang: Language;
  isDriver: boolean;
  rides: (PublishedTrip | Reservation)[];
  onCancelTrip?: (tripId: string) => Promise<boolean>;
  onCancelReservation?: (reservationId: string, raison?: string) => Promise<boolean>;
  onStartReservation?: (reservationId: string) => Promise<string | null>;
  onStartTrip?: (tripId: string) => Promise<void>;
}

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

export function PlannerProvider({
  children,
  lang,
  isDriver,
  rides,
  onCancelTrip,
  onCancelReservation,
  onStartReservation,
  onStartTrip,
}: PlannerProviderProps) {
  const searchParams = useSearchParams();
  const [currentDay, setCurrentDay] = useState<Date>(new Date());
  const [showAll, setShowAll] = useState<boolean>(() => searchParams.get("showAll") === "true");

  useEffect(() => {
    setShowAll(searchParams.get("showAll") === "true");
  }, [searchParams]);

  return (
    <PlannerContext.Provider
      value={{
        currentDay,
        setCurrentDay,
        showAll,
        setShowAll,
        lang,
        isDriver,
        rides,
        onCancelTrip,
        onCancelReservation,
        onStartReservation,
        onStartTrip,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlannerContext(): PlannerContextType {
  const ctx = useContext(PlannerContext);
  if (!ctx) {
    throw new Error("usePlannerContext doit etre utilise a l'interieur d'un PlannerProvider.");
  }
  return ctx;
}
