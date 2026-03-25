"use client";

/**
 * @file useDrafts.ts
 * @description Hook de configuration ListDetailPage pour les brouillons.
 *
 * Fournit uniquement tri, clés de recherche et message vide.
 * Les données et callbacks sont injectés par la page route (pattern dashboard).
 */

import type { DraftTrip } from "@/features/brouillons/types";
import type { SortOption } from "@/shared/components/list-detail-page";

// ─── Options de tri ──────────────────────────────────────────────────────────

const SORT_OPTIONS: SortOption[] = [
  {
    value: "recent",
    label: "Plus récent",
    compareFn: <T,>(a: T, b: T) =>
      new Date((b as unknown as DraftTrip).updatedAt).getTime() -
      new Date((a as unknown as DraftTrip).updatedAt).getTime(),
  },
  {
    value: "oldest",
    label: "Plus ancien",
    compareFn: <T,>(a: T, b: T) =>
      new Date((a as unknown as DraftTrip).updatedAt).getTime() -
      new Date((b as unknown as DraftTrip).updatedAt).getTime(),
  },
];

// ─── Clés de recherche ───────────────────────────────────────────────────────

const SEARCH_KEYS: string[] = [
  "departureLocation",
  "arrivalLocation",
  "notes",
];

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDraftsConfig() {
  return {
    sortOptions: SORT_OPTIONS,
    searchKeys:  SEARCH_KEYS,
    emptyMessage: "Vous n\u2019avez aucun brouillon pour le moment.",
  };
}
