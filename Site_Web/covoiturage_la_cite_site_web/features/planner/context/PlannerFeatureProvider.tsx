"use client";

/**
 * @file PlannerFeatureProvider.tsx
 * @description Provider racine du feature planner.
 *
 * Compose les trois contextes du feature dans le bon ordre d'imbrication :
 * 1. PlannerProvider       → données métier (lang, isDriver, rides, currentDay)
 * 2. IndisponibilityProvider → gestion des créneaux d'indisponibilité
 * 3. SearchBarProvider     → état de la barre de recherche + refs DOM
 *
 * Usage :
 * ```tsx
 * <PlannerFeatureProvider>
 *   <Hero />
 *   <SuperCalendar />
 *   <RideArea />
 * </PlannerFeatureProvider>
 * ```
 *
 * Remplace les trois providers imbriqués manuellement dans chaque page planner.
 */

import { ReactNode }                   from "react";
import { PlannerProvider }             from "@/features/planner/context/PlannerContext";
import { IndisponibilityProvider }     from "@/features/planner/context/IndisponibilityContext";
import { SearchBarProvider }           from "@/features/planner/context/SearchBarContext";

export function PlannerFeatureProvider({ children }: { children: ReactNode }) {
  return (
    // PlannerProvider en tête : fournit lang, isDriver, rides, currentDay
    <PlannerProvider>
      {/* IndisponibilityProvider : gestion des créneaux récurrents */}
      <IndisponibilityProvider>
        {/* SearchBarProvider : refs et état de la searchbar du Hero */}
        <SearchBarProvider>
          {children}
        </SearchBarProvider>
      </IndisponibilityProvider>
    </PlannerProvider>
  );
}
