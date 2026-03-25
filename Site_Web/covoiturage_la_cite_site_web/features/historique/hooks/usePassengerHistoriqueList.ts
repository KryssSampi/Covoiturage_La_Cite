"use client";

/**
 * Hook de configuration ListDetailPage pour l'historique des trajets du passager.
 * Fournit uniquement les options de tri, recherche et message vide.
 * Les données sont chargées au niveau de la page route (pattern dashboard).
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import type { SortOption } from "@/shared/components/list-detail-page";

export function usePassengerHistoriqueConfig() {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  // Tri par date
  const sortOptions: SortOption[] = useMemo(() => [
    {
      value: "date-desc",
      label: isFR ? "Plus récent" : "Newest",
      compareFn: <T,>(a: T, b: T) =>
        new Date(String((b as Record<string, unknown>).date)).getTime() -
        new Date(String((a as Record<string, unknown>).date)).getTime(),
    },
    {
      value: "date-asc",
      label: isFR ? "Plus ancien" : "Oldest",
      compareFn: <T,>(a: T, b: T) =>
        new Date(String((a as Record<string, unknown>).date)).getTime() -
        new Date(String((b as Record<string, unknown>).date)).getTime(),
    },
    {
      value: "price-asc",
      label: isFR ? "Prix croissant" : "Price (low to high)",
      compareFn: <T,>(a: T, b: T) =>
        ((a as Record<string, number>).price ?? 0) -
        ((b as Record<string, number>).price ?? 0),
    },
  ], [isFR]);

  // Recherche sur départ, destination, nom du conducteur
  const searchKeys = ["departure", "destination", "driver.name"];

  const emptyMessage = isFR
    ? "Aucun trajet dans l'historique."
    : "No trips in history.";

  return { sortOptions, searchKeys, emptyMessage };
}
