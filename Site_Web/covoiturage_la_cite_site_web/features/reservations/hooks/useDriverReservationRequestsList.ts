"use client";

/**
 * Hook de configuration ListDetailPage pour les demandes de réservation du conducteur.
 * Fournit uniquement les options de tri, recherche et message vide.
 * Les données sont chargées au niveau de la page route (pattern dashboard).
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import type { SortOption } from "@/shared/components/list-detail-page";

export function useDriverReservationRequestsConfig() {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  // Tri par date ou par note de l'applicant
  const sortOptions: SortOption[] = useMemo(() => [
    {
      value: "date-asc",
      label: isFR ? "Date (proche)" : "Date (soonest)",
      compareFn: <T,>(a: T, b: T) =>
        new Date(String((a as Record<string, unknown>).date)).getTime() -
        new Date(String((b as Record<string, unknown>).date)).getTime(),
    },
    {
      value: "date-desc",
      label: isFR ? "Date (lointaine)" : "Date (latest)",
      compareFn: <T,>(a: T, b: T) =>
        new Date(String((b as Record<string, unknown>).date)).getTime() -
        new Date(String((a as Record<string, unknown>).date)).getTime(),
    },
    {
      value: "note-desc",
      label: isFR ? "Meilleure note" : "Highest rating",
      compareFn: <T,>(a: T, b: T) => {
        const noteA = ((a as Record<string, Record<string, number>>).applicant)?.note ?? 0;
        const noteB = ((b as Record<string, Record<string, number>>).applicant)?.note ?? 0;
        return noteB - noteA;
      },
    },
  ], [isFR]);

  // Recherche sur départ, destination et nom de l'applicant
  const searchKeys = ["departure", "destination", "applicant.name"];

  const emptyMessage = isFR
    ? "Aucune demande de réservation pour le moment."
    : "No reservation requests at the moment.";

  return { sortOptions, searchKeys, emptyMessage };
}
