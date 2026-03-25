/**
 * Hook useAdminTrips — Charge la liste enrichie de tous les trajets
 * depuis la route GET /api/admin/trips.
 *
 * Offre aussi la fonction simulateEvent pour déclencher un événement
 * de simulation via POST /api/admin/simulate.
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import type { AdminTrip, SimulateResult, SimulationEvent } from "@/features/admin/types/adminTrips";

export function useAdminTrips() {
  const [trips, setTrips] = useState<AdminTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [simResult, setSimResult] = useState<SimulateResult | null>(null);
  const [simBusy, setSimBusy] = useState(false);

  const loadTrips = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/trips");
      if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
      const data = await res.json() as AdminTrip[];
      setTrips(data);
    } catch (err) {
      setError((err as Error).message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadTrips();
  }, [loadTrips]);

  const simulateEvent = useCallback(async (
    tripId: string,
    event: SimulationEvent,
    params?: { reservationId?: string },
  ) => {
    setSimBusy(true);
    setSimResult(null);
    try {
      const res = await fetch("/api/admin/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId, event, params }),
      });
      const data = await res.json() as SimulateResult & { error?: string };
      if (!res.ok) {
        setSimResult({ success: false, event, tripId, message: data.error ?? "Erreur", affectedReservations: 0 });
      } else {
        setSimResult(data);
        await loadTrips();
      }
    } catch (err) {
      setSimResult({
        success: false,
        event,
        tripId,
        message: (err as Error).message,
        affectedReservations: 0,
      });
    } finally {
      setSimBusy(false);
    }
  }, [loadTrips]);

  return { trips, loading, error, loadTrips, simResult, simBusy, simulateEvent };
}
