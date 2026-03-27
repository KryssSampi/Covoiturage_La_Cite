"use client";

/**
 * @file useDrafts.ts
 * @description Hook de configuration ListDetailPage pour les brouillons.
 *
 * Fournit tri, filtres, clés de recherche et message vide.
 * Les données et callbacks sont injectés par la page route (pattern dashboard).
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import type { DraftTrip } from "@/features/brouillons/types";
import type { FilterGroup, SortOption } from "@/shared/components/list-detail-page";

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDraftsConfig() {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  // Filtre par mode de paiement et complétude
  const filterGroups: FilterGroup[] = useMemo(() => [
    {
      title: isFR ? "Paiement" : "Payment",
      field: "paymentMethod",
      options: [
        { value: "cash",    label: isFR ? "Comptant" : "Cash"   },
        { value: "interac", label: "Interac"                     },
      ],
    },
    {
      title: isFR ? "Complétude" : "Completion",
      field: "isComplete",
      options: [
        { value: "complete",   label: isFR ? "Complet"   : "Complete"   },
        { value: "incomplete", label: isFR ? "Incomplet" : "Incomplete" },
      ],
      filterFn: (item, value) => {
        const d = item as DraftTrip;
        const complete = !!(
          d.departureLocation &&
          d.arrivalLocation &&
          d.departureDate &&
          d.departureTime &&
          d.vehicleId &&
          d.pricePerPassenger > 0
        );
        return value === "complete" ? complete : !complete;
      },
    },
  ], [isFR]);

  // Options de tri
  const sortOptions: SortOption[] = useMemo(() => [
    {
      value: "recent",
      label: isFR ? "Plus récent" : "Newest",
      compareFn: <T,>(a: T, b: T) =>
        new Date((b as unknown as DraftTrip).updatedAt).getTime() -
        new Date((a as unknown as DraftTrip).updatedAt).getTime(),
    },
    {
      value: "oldest",
      label: isFR ? "Plus ancien" : "Oldest",
      compareFn: <T,>(a: T, b: T) =>
        new Date((a as unknown as DraftTrip).updatedAt).getTime() -
        new Date((b as unknown as DraftTrip).updatedAt).getTime(),
    },
    {
      value: "price-asc",
      label: isFR ? "Prix croissant" : "Price (low to high)",
      compareFn: <T,>(a: T, b: T) =>
        ((a as unknown as DraftTrip).pricePerPassenger ?? 0) -
        ((b as unknown as DraftTrip).pricePerPassenger ?? 0),
    },
    {
      value: "price-desc",
      label: isFR ? "Prix décroissant" : "Price (high to low)",
      compareFn: <T,>(a: T, b: T) =>
        ((b as unknown as DraftTrip).pricePerPassenger ?? 0) -
        ((a as unknown as DraftTrip).pricePerPassenger ?? 0),
    },
  ], [isFR]);

  return {
    filterGroups,
    sortOptions,
    searchKeys: ["departureLocation", "arrivalLocation", "notes"] as string[],
    emptyMessage: isFR
      ? "Vous n\u2019avez aucun brouillon pour le moment."
      : "You have no drafts yet.",
  };
}
