"use client";

/**
 * @file PlannerContext.tsx
 * @description Context principal du feature planner.
 *
 * Source unique de vérité pour :
 * - La navigation par jour (currentDay)
 * - L'identité de l'utilisateur (lang, isDriver) — lu une seule fois depuis useAppState
 * - Les données de trajets (rides) — chargées depuis les fixtures/API une seule fois,
 *   partagées avec SuperCalendar et RideArea sans doublon d'import.
 *
 * TODO: Remplacer les imports fixtures par des appels API lorsque le backend sera prêt.
 */

import React, { createContext, useContext, useState, useMemo, ReactNode } from "react";

import { Language, useAppState }      from "@/core/state/app_state";
import { PublishedTrip, Reservation } from "@/features/dashboard/types";
import { FIXTURE_PUBLISHED_TRIPS }    from "@/tests/fixtures/dashboard/publishedtrips.fixtures";
import { FIXTURES_RESERVATIONS }      from "@/tests/fixtures/dashboard/reservations.fixtures";

// ─── TYPE DU CONTEXT ─────────────────────────────────────────────────────────

interface PlannerContextType {
  /** Jour sélectionné — partagé entre SuperCalendar et RideArea */
  currentDay:    Date;
  setCurrentDay: (day: Date) => void;

  /** Langue courante (source unique : appState.lang) */
  lang:          Language;

  /** Rôle conducteur calculé une seule fois (source unique : appState.userConnected) */
  isDriver:      boolean;

  /**
   * Liste complète des trajets filtrée par rôle.
   * Source unique : fixtures (sera remplacé par API).
   * Partagée entre SuperCalendar (saturation des cases) et RideArea (liste + filtre).
   */
  rides: (PublishedTrip | Reservation)[];
}

// ─── CONTEXT ─────────────────────────────────────────────────────────────────

const PlannerContext = createContext<PlannerContextType | undefined>(undefined);

// ─── PROVIDER ────────────────────────────────────────────────────────────────

export function PlannerProvider({ children }: { children: ReactNode }) {
  const appState = useAppState();
  const isDriver = appState.userConnected?.role.toString() === "driver";
  const lang     = appState.lang;

  const [currentDay, setCurrentDay] = useState<Date>(new Date());

  // Rides chargées une seule fois selon le rôle — remplacer par un appel API
  const rides = useMemo<(PublishedTrip | Reservation)[]>(
    () => (isDriver ? FIXTURE_PUBLISHED_TRIPS : FIXTURES_RESERVATIONS),
    [isDriver],
  );

  return (
    <PlannerContext.Provider value={{ currentDay, setCurrentDay, lang, isDriver, rides }}>
      {children}
    </PlannerContext.Provider>
  );
}

// ─── HOOK CONSOMMATEUR ───────────────────────────────────────────────────────

export function usePlannerContext(): PlannerContextType {
  const ctx = useContext(PlannerContext);
  if (!ctx) throw new Error("usePlannerContext doit être utilisé à l'intérieur d'un PlannerProvider.");
  return ctx;
}
