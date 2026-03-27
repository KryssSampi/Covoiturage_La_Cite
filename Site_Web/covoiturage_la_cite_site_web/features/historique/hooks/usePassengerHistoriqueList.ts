"use client";

/**
 * Hook de configuration ListDetailPage pour l'historique des trajets du passager.
 * Fournit uniquement les options de tri, recherche et message vide.
 * Les données sont chargées au niveau de la page route (pattern dashboard).
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import type { FilterGroup, SortOption } from "@/shared/components/list-detail-page";

export function usePassengerHistoriqueConfig() {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  // Filtre par fourchette de prix
  const filterGroups: FilterGroup[] = useMemo(() => [
    {
      title: isFR ? "Prix" : "Price",
      field: "priceRange",
      options: [
        { value: "low",    label: "< 10 $"   },
        { value: "medium", label: "10 – 20 $" },
        { value: "high",   label: "> 20 $"    },
      ],
      filterFn: (item, value) => {
        const price = ((item as Record<string, unknown>).price as number) ?? 0;
        if (value === "low")    return price < 10;
        if (value === "medium") return price >= 10 && price <= 20;
        if (value === "high")   return price > 20;
        return false;
      },
    },
  ], [isFR]);

  // Tri par date ou par prix
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
    {
      value: "price-desc",
      label: isFR ? "Prix décroissant" : "Price (high to low)",
      compareFn: <T,>(a: T, b: T) =>
        ((b as Record<string, number>).price ?? 0) -
        ((a as Record<string, number>).price ?? 0),
    },
  ], [isFR]);

  // Recherche sur départ, destination, nom du conducteur
  const searchKeys = ["departure", "destination", "driver.name"];

  const emptyMessage = isFR
    ? "Aucun trajet dans l'historique."
    : "No trips in history.";

  return { filterGroups, sortOptions, searchKeys, emptyMessage };
}
