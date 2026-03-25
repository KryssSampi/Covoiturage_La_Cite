/**
 * Hook pour la page Mes Finances.
 * Gère uniquement l'état local de la période — aucune donnée, aucun fetch.
 * Les données sont injectées par la page parente via les props.
 */
"use client";

import { useState } from "react";
import type { PeriodeFinance } from "@/features/finances/types/finances.types";

const PERIODES: PeriodeFinance[] = ["7j", "mois", "3mois", "tout"];

export function useFinances(initial: PeriodeFinance = "mois") {
  const [periode, setPeriode] = useState<PeriodeFinance>(initial);

  return {
    periode,
    setPeriode,
    periodes: PERIODES,
  };
}
