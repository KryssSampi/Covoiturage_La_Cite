"use client";

/**
 * Hook de configuration ListDetailPage pour les avis reçus.
 * Commun aux deux rôles. Fournit uniquement tri, recherche et message vide.
 * Les données sont chargées au niveau de la page route (pattern dashboard).
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import type { SortOption } from "@/shared/components/list-detail-page";

export function useReviewsConfig() {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  // Tri par date ou par note
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
      value: "rating-desc",
      label: isFR ? "Meilleure note" : "Highest rating",
      compareFn: <T,>(a: T, b: T) =>
        ((b as Record<string, number>).rating ?? 0) -
        ((a as Record<string, number>).rating ?? 0),
    },
    {
      value: "rating-asc",
      label: isFR ? "Note la plus basse" : "Lowest rating",
      compareFn: <T,>(a: T, b: T) =>
        ((a as Record<string, number>).rating ?? 0) -
        ((b as Record<string, number>).rating ?? 0),
    },
  ], [isFR]);

  // Recherche sur nom de l'évaluateur et commentaire
  const searchKeys = ["reviewer", "comment"];

  const emptyMessage = isFR
    ? "Aucun avis pour le moment."
    : "No reviews yet.";

  return { sortOptions, searchKeys, emptyMessage };
}
