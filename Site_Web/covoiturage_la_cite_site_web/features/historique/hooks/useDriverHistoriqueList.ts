"use client";

/**
 * Hook gérant la configuration ListDetailPage pour l'historique des trajets publiés du conducteur.
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import { useDb } from "@/core/context/db.context";
import { tripModelToPublishedTrip } from "@/features/dashboard/converters/dashboard.converter";
import { PublishedTripStatus } from "@/features/dashboard/types";
import type { FilterGroup, SortOption } from "@/shared/components/list-detail-page";

export function useDriverHistoriqueList() {
  const { lang } = useAppState();
  const { myTrips, reservations, users } = useDb();
  const isFR = lang === Language.FR;

  // Transformation des TripModel → PublishedTrip (type UI dashboard)
  const items = useMemo(
    () => myTrips.map((trip) => {
      const tripReservations = reservations.filter((r) => r.tripId === trip.id);
      const passengers = tripReservations
        .filter((r) => r.status === 'confirmed' || r.status === 'completed')
        .map((r) => users.find((u) => u.id === r.passengerId))
        .filter(Boolean) as (typeof users)[0][];
      const pendingCount = tripReservations.filter((r) => r.status === 'pending').length;
      return tripModelToPublishedTrip(trip, passengers, pendingCount);
    }),
    [myTrips, reservations, users],
  );

  // Filtre par statut du trajet
  const filterGroups: FilterGroup[] = useMemo(() => [
    {
      title: isFR ? "Statut" : "Status",
      field: "status",
      options: [
        { value: PublishedTripStatus.Published,  label: isFR ? "Publiée"   : "Published"   },
        { value: PublishedTripStatus.Confirmed,  label: isFR ? "Confirmée" : "Confirmed"   },
        { value: PublishedTripStatus.InProgress, label: isFR ? "En cours"  : "In Progress" },
        { value: PublishedTripStatus.Completed,  label: isFR ? "Terminée"  : "Completed"   },
        { value: PublishedTripStatus.Cancelled,  label: isFR ? "Annulée"   : "Cancelled"   },
        { value: PublishedTripStatus.Full,       label: isFR ? "Complet"   : "Full"         },
      ],
    },
  ], [isFR]);

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
      value: "price-desc",
      label: isFR ? "Prix décroissant" : "Price (high to low)",
      compareFn: <T,>(a: T, b: T) =>
        ((b as Record<string, number>).price ?? 0) -
        ((a as Record<string, number>).price ?? 0),
    },
  ], [isFR]);

  // Recherche sur départ, destination
  const searchKeys = ["departure", "destination"];

  const emptyMessage = isFR
    ? "Aucun trajet publié dans l'historique."
    : "No published trips in history.";

  return { items, filterGroups, sortOptions, searchKeys, emptyMessage };
}
