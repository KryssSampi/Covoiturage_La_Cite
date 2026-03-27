"use client";

import { useMemo, useState } from "react";

import { Language } from "@/core/state/app_state";
import { usePublishedTrips } from "@/features/dashboard/hooks/usePublishedTrips";
import { PublishedTrip, PublishedTripStatus, Reservation } from "@/features/dashboard/types";
import {
  DRIVER_STATUS_HEX,
  DRIVER_STATUS_LABELS,
  DRIVER_STATUSES,
  PASSENGER_STATUS_HEX,
  PASSENGER_STATUS_LABELS,
  PASSENGER_STATUSES,
} from "@/features/planner/constants/rides.area.constants";
import { usePlannerContext } from "@/features/planner/context/PlannerContext";
import type { SortKey, StatusCount } from "@/features/planner/types/rides.area.types";
import { normalizeRide } from "@/features/planner/utils/ride.normalizer";

export interface UseRideAreaReturn {
  isFr: boolean;
  isDriver: boolean;
  lang: Language;
  showAll: boolean;
  setShowAll: (v: boolean) => void;
  currentDay: Date;
  isToday: boolean;
  goPrevDay: () => void;
  goNextDay: () => void;
  goToday: () => void;
  filterStatus: string;
  setFilterStatus: (s: string) => void;
  sortBy: SortKey;
  setSortBy: (s: SortKey) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  hasActiveFilter: boolean;
  rawDayRides: (PublishedTrip | Reservation)[];
  visibleRides: (PublishedTrip | Reservation)[];
  statusCounts: StatusCount[];
  statusKeys: string[];
  statusLabels: Record<string, Record<Language, string>>;
  formatStatus: (status: PublishedTripStatus, lang: Language) => string;
  getStatusColor: (status: PublishedTripStatus) => string;
  onCancelTrip?: (tripId: string) => Promise<boolean>;
  onCancelReservation?: (reservationId: string, raison?: string) => Promise<boolean>;
  onStartReservation?: (reservationId: string) => Promise<string | null>;
  onStartTrip?: (tripId: string) => Promise<void>;
}

export function useRideArea(): UseRideAreaReturn {
  const {
    currentDay,
    setCurrentDay,
    showAll,
    setShowAll,
    lang,
    isDriver,
    rides,
    onCancelTrip,
    onCancelReservation,
    onStartReservation,
    onStartTrip,
  } = usePlannerContext();
  const isFr = lang === Language.FR;
  const isToday = currentDay.toDateString() === new Date().toDateString();

  const goPrevDay = () => setCurrentDay(new Date(currentDay.getTime() - 86_400_000));
  const goNextDay = () => setCurrentDay(new Date(currentDay.getTime() + 86_400_000));
  const goToday = () => setCurrentDay(new Date());

  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortKey>("time-asc");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { formatStatus, getStatusColor } = usePublishedTrips(isDriver ? (rides as PublishedTrip[]) : []);

  const rawDayRides = useMemo<(PublishedTrip | Reservation)[]>(() => {
    if (showAll) return [...rides];
    return rides.filter((ride) => normalizeRide(ride).start.toDateString() === currentDay.toDateString());
  }, [currentDay, rides, showAll]);

  const visibleRides = useMemo<(PublishedTrip | Reservation)[]>(() => {
    let filtered = [...rawDayRides];

    if (filterStatus !== "all") {
      filtered = filtered.filter((ride) => ride.status === filterStatus);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      filtered = filtered.filter(
        (ride) =>
          ride.departure.toLowerCase().includes(q) ||
          ride.destination.toLowerCase().includes(q),
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "time-asc") return a.time.localeCompare(b.time);
      if (sortBy === "time-desc") return b.time.localeCompare(a.time);
      if (sortBy === "status") return a.status.localeCompare(b.status);
      return 0;
    });

    return filtered;
  }, [rawDayRides, filterStatus, searchQuery, sortBy]);

  const statusHex = isDriver ? DRIVER_STATUS_HEX : PASSENGER_STATUS_HEX;
  const statusLabels = isDriver ? DRIVER_STATUS_LABELS : PASSENGER_STATUS_LABELS;
  const statusKeys = isDriver ? DRIVER_STATUSES : PASSENGER_STATUSES;

  const statusCounts = useMemo<StatusCount[]>(() => {
    return statusKeys
      .map((status) => ({
        status,
        count: rawDayRides.filter((ride) => ride.status === status).length,
        hex: statusHex[status] ?? "#9ca3af",
        label: statusLabels[status]?.[lang] ?? status,
      }))
      .filter((item) => item.count > 0);
  }, [lang, rawDayRides, statusHex, statusKeys, statusLabels]);

  const hasActiveFilter = filterStatus !== "all" || !!searchQuery.trim();

  return {
    isFr,
    isDriver,
    lang,
    showAll,
    setShowAll,
    currentDay,
    isToday,
    goPrevDay,
    goNextDay,
    goToday,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    searchQuery,
    setSearchQuery,
    hasActiveFilter,
    rawDayRides,
    visibleRides,
    statusCounts,
    statusKeys,
    statusLabels,
    formatStatus,
    getStatusColor,
    onCancelTrip,
    onCancelReservation,
    onStartReservation,
    onStartTrip,
  };
}
