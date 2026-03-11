"use client";

import { useIndisponibility } from "@/features/planner/context/IndisponibilityContext";
import type { IndisponibilityContextType } from "@/features/planner/context/IndisponibilityContext";

// ─── HOOK ─────────────────────────────────────────────────────────────────────

/**
 * Réexporte tous les éléments du contexte d'indisponibilité.
 * Point d'entrée recommandé pour les composants qui consomment ce contexte.
 *
 * @example
 * const { disponibilitySetterIsActive, markSlotUnavailable } = useIndisponibilityActions();
 */
export function useIndisponibilityActions(): IndisponibilityContextType {
  return useIndisponibility();
}
