"use client";

/**
 * Hook de configuration ListDetailPage pour les réservations du passager.
 * Fournit uniquement les filtres, options de tri, recherche et message vide.
 * Les données sont chargées au niveau de la page route (pattern dashboard).
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import { ReservationStatus } from "@/features/dashboard/types";
import type { FilterGroup, SortOption } from "@/shared/components/list-detail-page";

export function usePassengerReservationsConfig() {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  // Filtre par statut de réservation
  const filterGroups: FilterGroup[] = useMemo(() => [
    {
      title: isFR ? "Statut" : "Status",
      field: "status",
      options: [
        { value: ReservationStatus.Confirmed,  label: isFR ? "Confirmée"  : "Confirmed"   },
        { value: ReservationStatus.Pending,     label: isFR ? "En attente" : "Pending"     },
        { value: ReservationStatus.InProgress,  label: isFR ? "En cours"   : "In Progress" },
        { value: ReservationStatus.Completed,   label: isFR ? "Terminée"   : "Completed"   },
        { value: ReservationStatus.Cancelled,   label: isFR ? "Annulée"    : "Cancelled"   },
      ],
    },
  ], [isFR]);

  // Tri par date croissante ou décroissante
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
  ], [isFR]);

  // Recherche textuelle sur départ, destination et nom du conducteur
  const searchKeys = ["departure", "destination", "driver.name"];

  const emptyMessage = isFR
    ? "Aucune réservation pour le moment."
    : "No reservations at the moment.";

  return { filterGroups, sortOptions, searchKeys, emptyMessage };
}
