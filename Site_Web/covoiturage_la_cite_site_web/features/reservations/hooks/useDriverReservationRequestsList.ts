"use client";

/**
 * Hook de configuration ListDetailPage pour les demandes de réservation du conducteur.
 * Fournit uniquement les options de tri, recherche et message vide.
 * Les données sont chargées au niveau de la page route (pattern dashboard).
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import type { FilterGroup, SortOption } from "@/shared/components/list-detail-page";

export function useDriverReservationRequestsConfig() {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  // Filtre par fourchette de prix et note de l'applicant
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
    {
      title: isFR ? "Note du passager" : "Passenger rating",
      field: "ratingBand",
      options: [
        { value: "excellent", label: "≥ 4.5 ★" },
        { value: "good",      label: "≥ 4.0 ★" },
      ],
      filterFn: (item, value) => {
        const applicant = (item as Record<string, unknown>).applicant as Record<string, unknown> | undefined;
        const note = (applicant?.note as number) ?? 0;
        if (value === "excellent") return note >= 4.5;
        if (value === "good")      return note >= 4.0;
        return false;
      },
    },
  ], [isFR]);

  // Tri par date, note ou prix
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

  // Recherche sur départ, destination et nom de l'applicant
  const searchKeys = ["departure", "destination", "applicant.name"];

  const emptyMessage = isFR
    ? "Aucune demande de réservation pour le moment."
    : "No reservation requests at the moment.";

  return { filterGroups, sortOptions, searchKeys, emptyMessage };
}
