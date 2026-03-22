"use client";

/**
 * @file useRideArea.ts
 * @description Hook centralisant toute la logique de la zone de trajets :
 * navigation par jour, filtres, recherche, tri, compteurs de statuts.
 *
 * ❗ Toutes les données partagées (lang, isDriver, rides) proviennent du
 * PlannerContext — source unique pour le feature planner.
 * Ce hook ne lit plus ni useAppState() ni les fixtures directement.
 */

import { useMemo, useState, Dispatch, SetStateAction } from "react";

import { Language }                        from "@/core/state/app_state";
import { PublishedTrip, PublishedTripStatus, Reservation } from "@/features/dashboard/types";
import { usePublishedTrips }              from "@/features/dashboard/hooks/usePublishedTrips";
import { usePlannerContext }              from "@/features/planner/context/PlannerContext";
import {
  DRIVER_STATUS_HEX,
  PASSENGER_STATUS_HEX,
  DRIVER_STATUS_LABELS,
  PASSENGER_STATUS_LABELS,
  DRIVER_STATUSES,
  PASSENGER_STATUSES,
}                                         from "@/features/planner/constants/rides.area.constants";
import type { SortKey, StatusCount }      from "@/features/planner/types/rides.area.types";

// ─── TYPE DE RETOUR ───────────────────────────────────────────────────────────

export interface UseRideAreaReturn {
  // ─ méta ─
  isFr:     boolean;
  isDriver: boolean;
  lang:     Language;

  // ─ mode « voir tout » ─
  showAll:    boolean;
  setShowAll: (v: boolean) => void;

  // ─ navigation par jour ─
  currentDay: Date;
  isToday:    boolean;
  goPrevDay:  () => void;
  goNextDay:  () => void;
  goToday:    () => void;

  // ─ filtres & tri ─
  filterStatus:    string;
  setFilterStatus: (s: string) => void;
  sortBy:          SortKey;
  setSortBy:       (s: SortKey) => void;
  searchQuery:     string;
  setSearchQuery:  (q: string) => void;
  hasActiveFilter: boolean;

  // ─ données calculées ─
  rawDayRides:  (PublishedTrip | Reservation)[];
  visibleRides: (PublishedTrip | Reservation)[];
  statusCounts: StatusCount[];
  statusKeys:   string[];
  statusLabels: Record<string, Record<Language, string>>;

  // ─ hook conducteur (PublishedTripCard) ─
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  isPassengerListOpens:    any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setIsPassengerListOpens: (v: any) => void;
  formatStatus:            (status: PublishedTripStatus, lang: Language) => string;
  getStatusColor:          (status: PublishedTripStatus) => string;

  // ─ état liste passager (ReservationCard) ─
  openPassengerLists:    boolean[];
  setOpenPassengerLists: Dispatch<SetStateAction<boolean[]>>;
}

// ─── HOOK ─────────────────────────────────────────────────────────────────────

export function useRideArea(): UseRideAreaReturn {
  // ─── Source unique : PlannerContext ──────────────────────────────────────
  const { currentDay, setCurrentDay, showAll, setShowAll, lang, isDriver, rides } = usePlannerContext();
  const isFr    = lang === Language.FR;
  const isToday = currentDay.toDateString() === new Date().toDateString();

  /** Avancer au jour précédent */
  const goPrevDay = () => setCurrentDay(new Date(currentDay.getTime() - 86_400_000));
  /** Avancer au jour suivant */
  const goNextDay = () => setCurrentDay(new Date(currentDay.getTime() + 86_400_000));
  /** Revenir à aujourd'hui */
  const goToday   = () => setCurrentDay(new Date());

  // ─── État des filtres ─────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy,       setSortBy]       = useState<SortKey>("time-asc");
  const [searchQuery,  setSearchQuery]  = useState<string>("");

  // ─── Hook conducteur ──────────────────────────────────────────────────────
  const {
    isPassengerListOpens,
    setIsPassengerListOpens,
    formatStatus,
    getStatusColor,
  } = usePublishedTrips(isDriver ? rides as PublishedTrip[] : []);

  // ─── État liste passager pour ReservationCard ─────────────────────────────
  const [openPassengerLists, setOpenPassengerLists] = useState<boolean[]>(
    () => rides.map(() => false),
  );

  // ─── Trajets bruts : tous les trajets ou seulement ceux du jour ──────────
  const rawDayRides = useMemo<(PublishedTrip | Reservation)[]>(() => {
    if (showAll) return [...rides];
    return rides.filter(trip => {
      const tripDate = new Date(trip.date);
      return tripDate.toDateString() === currentDay.toDateString();
    });
  }, [currentDay, rides, showAll]);

  // ─── Application filtre + recherche + tri ────────────────────────────────
  const visibleRides = useMemo<(PublishedTrip | Reservation)[]>(() => {
    // Variable locale renommée pour éviter le shadowing avec `rides` du contexte
    let filtered = [...rawDayRides];

    // Filtre par statut
    if (filterStatus !== "all") {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    // Filtre par texte (départ ou destination)
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        r =>
          r.departure.toLowerCase().includes(q) ||
          r.destination.toLowerCase().includes(q),
      );
    }

    // Tri
    filtered.sort((a, b) => {
      if (sortBy === "time-asc")  return a.time.localeCompare(b.time);
      if (sortBy === "time-desc") return b.time.localeCompare(a.time);
      if (sortBy === "status")    return a.status.localeCompare(b.status);
      return 0;
    });

    return filtered;
  }, [rawDayRides, filterStatus, searchQuery, sortBy]);

  // ─── Compteurs de statuts du jour ─────────────────────────────────────────
  const statusHex    = isDriver ? DRIVER_STATUS_HEX    : PASSENGER_STATUS_HEX;
  const statusLabels = isDriver ? DRIVER_STATUS_LABELS : PASSENGER_STATUS_LABELS;
  const statusKeys   = isDriver ? DRIVER_STATUSES      : PASSENGER_STATUSES;

  const statusCounts = useMemo<StatusCount[]>(() => {
    return statusKeys
      .map(s => ({
        status: s,
        count:  rawDayRides.filter(r => r.status === s).length,
        hex:    statusHex[s]    ?? "#9ca3af",
        label:  statusLabels[s]?.[lang] ?? s,
      }))
      .filter(sc => sc.count > 0);
  }, [rawDayRides, statusKeys, statusHex, statusLabels, lang]);

  const hasActiveFilter = filterStatus !== "all" || !!searchQuery.trim();

  return {
    isFr, isDriver, lang,
    showAll, setShowAll,
    currentDay, isToday, goPrevDay, goNextDay, goToday,
    filterStatus, setFilterStatus,
    sortBy, setSortBy,
    searchQuery, setSearchQuery,
    hasActiveFilter,
    rawDayRides, visibleRides, statusCounts,
    statusKeys, statusLabels,
    isPassengerListOpens, setIsPassengerListOpens,
    formatStatus, getStatusColor,
    openPassengerLists, setOpenPassengerLists,
  };
}
