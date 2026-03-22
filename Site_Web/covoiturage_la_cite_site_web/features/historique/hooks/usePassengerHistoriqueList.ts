"use client";

/**
 * Hook gérant la configuration ListDetailPage pour l'historique des trajets du passager.
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import { useDb } from "@/core/context/db.context";
import { tripModelToTrip } from "@/features/dashboard/converters/dashboard.converter";
import type { SortOption } from "@/shared/components/list-detail-page";

export function usePassengerHistoriqueList() {
  const { lang } = useAppState();
  const { myReservations, trips, users } = useDb();
  const isFR = lang === Language.FR;

  // Transformation des trajets liés aux réservations → Trip (type UI dashboard)
  const items = useMemo(
    () => myReservations
      .map((res) => {
        const trip   = trips.find((t) => t.id === res.tripId);
        const driver = trip ? users.find((u) => u.id === trip.driverId) : undefined;
        if (!trip || !driver) return null;
        const passengers = trip.passengerIds
          .map((pid) => users.find((u) => u.id === pid))
          .filter(Boolean) as (typeof users)[0][];
        return tripModelToTrip(trip, driver, passengers);
      })
      .filter((t): t is NonNullable<typeof t> => t !== null),
    [myReservations, trips, users],
  );

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

  return { items, sortOptions, searchKeys, emptyMessage };
}
