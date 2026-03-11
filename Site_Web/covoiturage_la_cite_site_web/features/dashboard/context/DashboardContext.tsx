"use client";

/**
 * @file DashboardContext.tsx
 * @description Source unique de données pour le feature dashboard.
 *
 * Toutes les données partagées entre les composants du dashboard (lang, isDriver,
 * reservations, trajets recommandés, destinations) sont centralisées ici.
 * Les hooks du feature (useReservations, useRecommendedRides, etc.) lisent
 * dorénavant depuis ce contexte plutôt que d'importer les fixtures directement.
 *
 * @pattern Provider > Context > Hook (useDashboardContext)
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { Language, useAppState }           from "@/core/state/app_state";
import { FIXTURES_RESERVATIONS }           from "@/tests/fixtures/dashboard/reservations.fixtures";
import { FIXTURES_TRIPS }                  from "@/tests/fixtures/dashboard/trips.fixtures";
import { FIXTURES_RECENT_DESTINATIONS }    from "@/tests/fixtures/dashboard/recentDestination.fixtures";
import { FIXTURES_USUAL_DESTINATIONS }     from "@/tests/fixtures/dashboard/usualDestination.fixtures";
import type { Reservation }                from "@/features/dashboard/types";
import type { Trip }                       from "@/features/dashboard/types";
import type { Destination }                from "@/features/dashboard/types";

// ─── TYPE DU CONTEXTE ─────────────────────────────────────────────────────────

interface DashboardContextType {
  /** Langue active de l'application */
  lang: Language;
  /** Vrai si l'utilisateur connecté est un conducteur */
  isDriver: boolean;
  /** Liste complète des réservations (passager) ou trajets publiés (conducteur) */
  reservations: Reservation[];
  /** Trajets recommandés pour le passager */
  recommendedTrips: Trip[];
  /** Destinations récentes de l'utilisateur */
  recentDestinations: Destination[];
  /** Destinations habituelles de l'utilisateur */
  usualDestinations: Destination[];
}

// ─── CONTEXTE ──────────────────────────────────────────────────────────────────

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

// ─── PROVIDER ──────────────────────────────────────────────────────────────────

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  // Lecture unique de l'état global — source de vérité pour lang et le rôle
  const appState = useAppState();
  const lang     = appState.lang ?? Language.FR;
  const isDriver = appState.userConnected?.role.toString() === "driver";

  // Mémorisation des données pour éviter les re-rendus inutiles
  const reservations        = useMemo(() => FIXTURES_RESERVATIONS,        []);
  const recommendedTrips    = useMemo(() => FIXTURES_TRIPS,               []);
  const recentDestinations  = useMemo(() => FIXTURES_RECENT_DESTINATIONS, []);
  const usualDestinations   = useMemo(() => FIXTURES_USUAL_DESTINATIONS,  []);

  const value: DashboardContextType = {
    lang,
    isDriver,
    reservations,
    recommendedTrips,
    recentDestinations,
    usualDestinations,
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// ─── HOOK D'ACCÈS ─────────────────────────────────────────────────────────────

/**
 * Accède au DashboardContext.
 * Doit être utilisé à l'intérieur d'un DashboardProvider.
 *
 * @throws {Error} si utilisé hors d'un DashboardProvider
 */
export function useDashboardContext(): DashboardContextType {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardContext doit être utilisé dans un <DashboardProvider>");
  }
  return ctx;
}
