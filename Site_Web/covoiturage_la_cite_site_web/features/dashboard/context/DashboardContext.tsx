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

import { createContext, useContext, useMemo, useState, useEffect, type ReactNode } from "react";

import { Language, useAppState }           from "@/core/state/app_state";
import {
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

  // DbProvider supprimé — les dashboards chargent leurs données via leurs propres fetch/polling
  const trips: import("@/core/models/TripModel").TripModel[] = [];
  const myReservations: import("@/core/models/ReservationModel").ReservationModel[] = [];
  const allReservations: import("@/core/models/ReservationModel").ReservationModel[] = [];
  const users: import("@/core/models/UserModel").UserModel[] = [];
  const myIndisponibility = null;

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

  const [recommendedTrips, setRecommendedTrips] = useState<Trip[]>([]);


  // Destinations : tentative de lecture via API BFF, fallback fixtures si indisponible
  const [recentDestinations, setRecentDestinations] = useState<Destination[]>(() => FIXTURES_RECENT_DESTINATIONS);
  const [usualDestinations, setUsualDestinations] = useState<Destination[]>(() => FIXTURES_USUAL_DESTINATIONS);
  const surveyRecent        = useMemo(() => FIXTURES_SURVEY_RECENT,        []);
  const surveyUsual         = useMemo(() => FIXTURES_SURVEY_USUAL,         []);
  const surveyWishing       = useMemo(() => FIXTURES_SURVEY_WISHING,       []);

  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;

    (async () => {
      try {
        const [resRecent, resUsual] = await Promise.all([
          fetch(`/api/passenger/${currentUserId}/recent-destinations?limit=5`, { credentials: 'same-origin' }),
          fetch(`/api/passenger/${currentUserId}/usual-destinations?limit=5`, { credentials: 'same-origin' }),
        ]);

        if (cancelled) return;

        if (resRecent.ok) {
          const data = await resRecent.json();
          if (!cancelled && Array.isArray(data)) setRecentDestinations(data);
        }

        if (resUsual.ok) {
          const data = await resUsual.json();
          if (!cancelled && Array.isArray(data)) setUsualDestinations(data);
        }
      } catch (err) {
        console.error('[DashboardProvider] fetch destinations', err);
      }
    })();

    return () => { cancelled = true; };
  }, [currentUserId]);

  useEffect(() => {
    if (!currentUserId) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/trips/recommended', { credentials: 'same-origin' });
        if (!cancelled && res.ok) {
          const data = await res.json();
          if (!cancelled && Array.isArray(data)) setRecommendedTrips(data);
        }
      } catch (err) {
        console.error('[DashboardProvider] fetch recommended trips', err);
      }
    })();
    return () => { cancelled = true; };
  }, [currentUserId]);

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
