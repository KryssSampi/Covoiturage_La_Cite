"use client";

/**
 * Hook gérant la configuration ListDetailPage pour les demandes de réservation du conducteur.
 * Fournit les données réelles via useDb() et les options de tri par date ou note.
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import { useDb } from "@/core/context/db.context";
import { reservationToDriverRequest } from "@/features/reservations/converters/reservation.converter";
import type { SortOption } from "@/shared/components/list-detail-page";

export function useDriverReservationRequestsList() {
  const { lang, userConnected } = useAppState();
  const isFR = lang === Language.FR;

  // Données réelles depuis le DbProvider
  const { reservations, trips, users } = useDb();

  // Map de recherche rapide sur les utilisateurs
  const usersMap = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users]
  );

  // Filtrer les demandes en attente pour le conducteur connecté et les convertir
  const items = useMemo(
    () =>
      reservations
        .filter(
          (r) =>
            r.driverId === userConnected?.id && r.status === "pending"
        )
        .map((r) => {
          const trip      = trips.find((t) => t.id === r.tripId);
          const passenger = usersMap.get(r.passengerId);
          if (!trip || !passenger) return null;
          return reservationToDriverRequest(r, trip, passenger);
        })
        .filter((r) => r !== null),
    [reservations, trips, usersMap, userConnected?.id]
  );

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

  return { items, sortOptions, searchKeys, emptyMessage };
}
