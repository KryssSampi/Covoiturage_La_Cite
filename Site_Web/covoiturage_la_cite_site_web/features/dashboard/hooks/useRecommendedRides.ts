// features/dashboard/hooks/useRecommendedRides.ts

import { useMemo, useState, useEffect } from "react";
import { useDashboardContext } from "@/features/dashboard/context/DashboardContext";
import type { Trip } from "../types";
import type { TrajetResponseDto } from "@/server/services/TripService";

interface UseRecommendedRidesReturn {
  trips: Trip[];
  isEmpty: boolean;
  openPassengerLists: boolean[];
  togglePassengerList: (index: number) => void;
  closePassengerList: (index: number) => void;
}

export function useRecommendedRides(): UseRecommendedRidesReturn {
  const { recommendedTrips: rawTrips } = useDashboardContext();
  const [apiTrips, setApiTrips] = useState<Trip[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    const toTrip = (dto: TrajetResponseDto): Trip => {
      const departure = dto.departureLabel || dto.departureAddress || "";
      const destination = dto.arrivalLabel || dto.arrivalAddress || "";
      const driverName = dto.driver
        ? `${dto.driver.firstName} ${dto.driver.lastName}`.trim()
        : "Conducteur";

      return {
        id: dto.id,
        departure,
        destination,
        date: dto.departureDate ?? "",
        time: dto.departureTime ?? "",
        price: Number(dto.pricePerPassenger ?? 0),
        maxPassengers: Number(dto.maxPassengers ?? 0),
        passengers: [],
        driver: {
          id: dto.driverId,
          pictureUrl: dto.driver?.avatarUrl ?? "",
          name: driverName,
          rating: Number(dto.driver?.averageRating ?? 0),
          tripsCount: 0,
        },
        doneDate: null,
        departureCoords:
          dto.departureLng != null && dto.departureLat != null
            ? [Number(dto.departureLng), Number(dto.departureLat)]
            : undefined,
        arrivalCoords:
          dto.arrivalLng != null && dto.arrivalLat != null
            ? [Number(dto.arrivalLng), Number(dto.arrivalLat)]
            : undefined,
      };
    };

    (async () => {
      try {
        const res = await fetch("/api/trips/recommended", { credentials: "same-origin" });
        if (!res.ok || cancelled) return;
        const payload = (await res.json()) as unknown;
        if (!Array.isArray(payload) || cancelled) return;
        setApiTrips((payload as TrajetResponseDto[]).map(toTrip));
      } catch (error) {
        console.error("[useRecommendedRides] fetch", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const trips = useMemo(
    () => [...(apiTrips ?? rawTrips)].sort((a, b) => a.date.localeCompare(b.date)),
    [apiTrips, rawTrips]
  );

  const [openPassengerLists, setOpenPassengerLists] = useState<boolean[]>(
    () => trips.map(() => false)
  );

  const togglePassengerList = (index: number) =>
    setOpenPassengerLists((prev) => prev.map((v, i) => (i === index ? !v : v)));

  const closePassengerList = (index: number) =>
    setOpenPassengerLists((prev) => prev.map((v, i) => (i === index ? false : v)));

  return {
    trips,
    isEmpty: trips.length === 0,
    openPassengerLists,
    togglePassengerList,
    closePassengerList,
  };
}
