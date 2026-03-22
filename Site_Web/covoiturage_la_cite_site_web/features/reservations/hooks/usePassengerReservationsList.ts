"use client";

/**
 * Hook gérant la configuration ListDetailPage pour les réservations du passager.
 * Fournit les données réelles via useDb(), les filtres par statut et les options de tri.
 */

import { useMemo } from "react";
import { Language, useAppState } from "@/core/state/app_state";
import { useDb } from "@/core/context/db.context";
import { reservationToPassengerView } from "@/features/reservations/converters/reservation.converter";
import { ReservationStatus } from "@/features/dashboard/types";
import type { FilterGroup, SortOption } from "@/shared/components/list-detail-page";

export function usePassengerReservationsList() {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  // Données réelles depuis le DbProvider : réservations du passager connecté
  const { myReservations, trips, users } = useDb();

  // Map de recherche rapide sur les utilisateurs
  const usersMap = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users]
  );

  // Conversion des ReservationModel en Reservation (format UI dashboard)
  const items = useMemo(
    () =>
      myReservations
        .map((r) => {
          const trip   = trips.find((t) => t.id === r.tripId);
          const driver = usersMap.get(r.driverId);
          if (!trip || !driver) return null;
          return reservationToPassengerView(r, trip, driver);
        })
        .filter((r) => r !== null),
    [myReservations, trips, usersMap]
  );

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

  return { items, filterGroups, sortOptions, searchKeys, emptyMessage };
}
