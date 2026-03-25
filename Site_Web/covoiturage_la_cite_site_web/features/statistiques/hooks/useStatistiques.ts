/**
 * Hook de configuration pour la feature Statistiques.
 *
 * Ne fait AUCUN fetch, AUCUN useDb — gestion de l'état local uniquement.
 * Les données sont reçues en paramètre (injectées depuis la page route).
 * Le changement de période déclenche un nouveau fetch dans la page route.
 */
"use client";

import { useState } from "react";
import type { Periode } from "../types/statistiques.types";

// ─── Périodes disponibles ────────────────────────────────────────────────────

const PERIODES: Periode[] = ["7j", "mois", "3mois", "6mois", "tout"];

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useStatistiques(initialPeriode: Periode = "mois") {
  const [periode, setPeriode] = useState<Periode>(initialPeriode);

  return {
    periode,
    setPeriode,
    periodes: PERIODES,
  };
}
