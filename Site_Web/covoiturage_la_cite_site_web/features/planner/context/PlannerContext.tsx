"use client";

/**
 * @file PlannerContext.tsx
 * @description Context principal du feature planner.
 *
 * Source unique de vérité pour :
 * - La navigation par jour (currentDay)
 * - L'identité de l'utilisateur (lang, isDriver) — lu une seule fois depuis useAppState
 * - Les données de trajets (rides) — chargées depuis la base JSON via useDb.
 */

import React, { createContext, useContext, useState, useMemo, useEffect, ReactNode } from "react";
import { useSearchParams }            from "next/navigation";

import { Language, useAppState }      from "@/core/state/app_state";
import { useDb }                      from "@/core/context/db.context";
import { PublishedTrip, Reservation } from "@/features/dashboard/types";
import {
  tripModelToPublishedTrip,
  tripModelToReservation,
}                                     from "@/features/dashboard/converters/dashboard.converter";

// ─── TYPE DU CONTEXT ─────────────────────────────────────────────────────────

interface PlannerContextType {
  /** Jour sélectionné — partagé entre SuperCalendar et RideArea */
  currentDay:    Date;
  setCurrentDay: (day: Date) => void;

  /** Mode "voir tout" — affiche tous les trajets au lieu d'un seul jour */
  showAll:       boolean;
  setShowAll:    (v: boolean) => void;

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
  const searchParams = useSearchParams();
  const isDriver = appState.userConnected?.role.toString() === "conducteur";
  const lang     = appState.lang;

  const { myTrips, myReservations, trips, reservations, users } = useDb();

  const [currentDay, setCurrentDay] = useState<Date>(new Date());

  // Initialise showAll depuis le paramètre URL ?showAll=true (passé par la section réservations)
  const [showAll, setShowAll] = useState<boolean>(
    () => searchParams.get('showAll') === 'true'
  );

  // Synchroniser si les search params changent (navigation interne)
  useEffect(() => {
    if (searchParams.get('showAll') === 'true') {
      setShowAll(true);
    }
  }, [searchParams]);

  // Rides dérivées de la base JSON selon le rôle
  const rides = useMemo<(PublishedTrip | Reservation)[]>(() => {
    if (isDriver) {
      return myTrips.map((trip) => {
        const tripReservations = reservations.filter((r) => r.tripId === trip.id);
        const passengers = tripReservations
          .filter((r) => r.status === "confirmed" || r.status === "completed")
          .map((r) => users.find((u) => u.id === r.passengerId))
          .filter(Boolean) as (typeof users)[0][];
        const pendingCount = tripReservations.filter((r) => r.status === "pending").length;
        return tripModelToPublishedTrip(trip, passengers, pendingCount);
      });
    }
    // Passager : on remonte les trajets liés aux réservations
    return myReservations.map((res) => {
      const trip   = trips.find((t) => t.id === res.tripId);
      const driver = trip ? users.find((u) => u.id === trip.driverId) : undefined;
      if (!trip || !driver) return null;
      return tripModelToReservation(trip, res, driver);
    }).filter(Boolean) as Reservation[];
  }, [isDriver, myTrips, myReservations, trips, reservations, users]);

  return (
    <PlannerContext.Provider value={{ currentDay, setCurrentDay, showAll, setShowAll, lang, isDriver, rides }}>
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
