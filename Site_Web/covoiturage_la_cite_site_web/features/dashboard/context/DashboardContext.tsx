"use client";

/**
 * @file DashboardContext.tsx
 * @description Source unique de données pour le feature dashboard.
 *
 * Toutes les données partagées entre les composants du dashboard (lang, isDriver,
 * reservations, trajets recommandés, destinations) sont centralisées ici.
 * Les données réelles viennent du DbProvider (base statique JSON).
 * Les destinations/survey restent en fixtures (données non-critiques pour le test).
 *
 * @pattern Provider > Context > Hook (useDashboardContext)
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";

import { Language, useAppState }           from "@/core/state/app_state";
import { useDb }                           from "@/core/context/db.context";
import { isTripBlockedByIndisponibility } from "@/core/utils/indisponibility.utils";
import {
  tripModelToTrip,
  tripModelToReservation,
}                                          from "@/features/dashboard/converters/dashboard.converter";
import { FIXTURES_RECENT_DESTINATIONS }    from "@/tests/fixtures/dashboard/recentDestination.fixtures";
import { FIXTURES_USUAL_DESTINATIONS }     from "@/tests/fixtures/dashboard/usualDestination.fixtures";
import { FIXTURES_SURVEY_RECENT, FIXTURES_SURVEY_USUAL, FIXTURES_SURVEY_WISHING } from "@/tests/fixtures/dashboard/surveyDestination.fixtures";
import type { Reservation }                from "@/features/dashboard/types";
import type { Trip }                       from "@/features/dashboard/types";
import type { Destination }                from "@/features/dashboard/types";
import type { SurveyDestination }          from "@/features/dashboard/types";

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
  /** Destinations récentes surveillées (avec matching en arrière-plan) */
  surveyRecent: SurveyDestination[];
  /** Destinations habituelles surveillées (avec matching en arrière-plan) */
  surveyUsual: SurveyDestination[];
  /** Destinations souhaitées (alertes wishing trip) */
  surveyWishing: SurveyDestination[];
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

  // Données réelles depuis la base JSON via DbProvider
  const { trips, myReservations, reservations: allReservations, users, myIndisponibility } = useDb();

  // ID du passager connecté — pour exclure ses propres trajets des recommandations
  const currentUserId = appState.userConnected?.id ?? null;

  // Mémorisation du Map des utilisateurs pour les convertisseurs
  const usersMap = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users]
  );

  // Réservations pour le passager : myReservations converties en Reservation UI
  const reservations = useMemo((): Reservation[] => {
    return myReservations
      .map((r) => {
        const trip   = trips.find((t) => t.id === r.tripId);
        const driver = usersMap.get(r.driverId);
        if (!trip || !driver) return null;
        return tripModelToReservation(trip, r, driver);
      })
      .filter((r): r is Reservation => r !== null);
  }, [myReservations, trips, usersMap]);

  // Trajets recommandés pour le passager : trajets publiés/full convertis en Trip UI
  // Exclut les trajets du passager connecté (conducteur ou déjà réservé)
  const recommendedTrips = useMemo((): Trip[] => {
    // IDs des trajets déjà réservés par le passager connecté (peu importe le statut)
    const reservedTripIds = currentUserId
      ? new Set(allReservations
          .filter((r) => r.passengerId === currentUserId && r.status !== 'cancelled' && r.status !== 'refused')
          .map((r) => r.tripId))
      : new Set<string>();

    return trips
      .filter((t) =>
        t.status === "published" &&              // uniquement les trajets avec places disponibles
        t.driverId !== currentUserId &&          // pas ses propres trajets
        !reservedTripIds.has(t.id) &&            // pas déjà réservé
        t.passengerIds.length < t.maxPassengers && // pas complet
        !isTripBlockedByIndisponibility(t, myIndisponibility)
      )
      .map((t) => {
        const driver     = usersMap.get(t.driverId);
        const passengers = t.passengerIds
          .map((id) => usersMap.get(id))
          .filter((u) => u !== undefined);
        if (!driver) return null;
        return tripModelToTrip(t, driver, passengers);
      })
      .filter((t): t is Trip => t !== null);
  }, [trips, usersMap, currentUserId, allReservations, myIndisponibility]);

  // Destinations : gardées en fixtures (non critiques pour le test du cycle de vie)
  const recentDestinations  = useMemo(() => FIXTURES_RECENT_DESTINATIONS, []);
  const usualDestinations   = useMemo(() => FIXTURES_USUAL_DESTINATIONS,  []);
  const surveyRecent        = useMemo(() => FIXTURES_SURVEY_RECENT,        []);
  const surveyUsual         = useMemo(() => FIXTURES_SURVEY_USUAL,         []);
  const surveyWishing       = useMemo(() => FIXTURES_SURVEY_WISHING,       []);

  const value: DashboardContextType = {
    lang,
    isDriver,
    reservations,
    recommendedTrips,
    recentDestinations,
    usualDestinations,
    surveyRecent,
    surveyUsual,
    surveyWishing,
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
