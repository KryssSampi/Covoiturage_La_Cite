"use client";

import { useEffect, useRef, useState } from "react";
import type { PublishedTrip } from "@/features/dashboard/types";
import { PublishedTripStatus } from "@/features/dashboard/types";

interface UseLiveTripsResult {
  trips: PublishedTrip[] | null;
  isLoading: boolean;
  error: string | null;
  hasInProgressTrip: boolean;
}

export function useLiveTrips(driverId: string | undefined): UseLiveTripsResult {
  const [trips, setTrips] = useState<PublishedTrip[] | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!driverId);
  const [error, setError] = useState<string | null>(null);
  const [hasInProgressTrip, setHasInProgressTrip] = useState(false);
  const tripsRef = useRef(trips);
  useEffect(() => { tripsRef.current = trips; }, [trips]);

  useEffect(() => {
    if (!driverId) return;
    let cancelled = false;

    const fetchTrips = async () => {
      try {
        const res = await fetch(`/api/dashboard/driver/${encodeURIComponent(driverId)}`);
        if (!res.ok) throw new Error("Echec chargement trajets");
        const data = await res.json();
        if (cancelled) return;
        const publishedTrips: PublishedTrip[] = data.publishedTrips ?? [];
        setTrips(publishedTrips);
        setHasInProgressTrip(publishedTrips.some((t) => t.status === PublishedTripStatus.InProgress));
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error("[useLiveTrips] fetch", err);
        if (!tripsRef.current) {
          setError("Impossible de charger les trajets.");
          setIsLoading(false);
        }
      }
    };

    void fetchTrips();
    const intervalId = setInterval(() => { void fetchTrips(); }, 30_000);
    return () => { cancelled = true; clearInterval(intervalId); };
  }, [driverId]);

  return { trips, isLoading, error, hasInProgressTrip };
}
