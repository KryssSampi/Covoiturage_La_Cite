/**
 * Hook useAdminTrips — Charge la liste enrichie de tous les trajets
 * depuis la route GET /api/admin/trips.
 *
 * Offre aussi la fonction simulateEvent pour déclencher un événement
 * de simulation via POST /api/admin/simulate.
 */
"use client";

import { useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SimulationEvent =
  | "retard_15_30"
  | "retard_30_60"
  | "retard_60plus"
  | "annulation_conducteur"
  | "no_show_conducteur"
  | "no_show_passager"
  | "trajet_complete"
  | "litige"
  | "accident";

export interface AdminReservation {
  id: string;
  passengerId: string;
  passengerName: string;
  status: string;
  [key: string]: unknown;
}

export interface AdminTrip {
  id: string;
  driverId: string;
  driverName: string;
  status: string;
  pricePerPassenger: number;
  totalPassengers: number;
  reservations: AdminReservation[];
  departureTime?: string;
  departureDate?: string;
  departure?: { label: string };
  arrival?: { label: string };
  [key: string]: unknown;
}

export interface SimulateResult {
  success: boolean;
  event: SimulationEvent;
  tripId: string;
  message: string;
  penalite?: { montant: number; pointsReputation: number; suspension?: string } | null;
  affectedReservations: number;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAdminTrips() {
  const [trips, setTrips]       = useState<AdminTrip[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [simResult, setSimResult] = useState<SimulateResult | null>(null);
  const [simBusy, setSimBusy]   = useState(false);

  // ── Chargement des trajets ────────────────────────────────────────────────
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

  useEffect(() => { void loadTrips(); }, [loadTrips]);

  // ── Simulation d'un événement ─────────────────────────────────────────────
  const simulateEvent = useCallback(async (
    tripId: string,
    event: SimulationEvent,
    params?: { reservationId?: string }
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
        // Recharge les trajets pour refléter les changements
        await loadTrips();
      }
    } catch (err) {
      setSimResult({ success: false, event, tripId, message: (err as Error).message, affectedReservations: 0 });
    } finally {
      setSimBusy(false);
    }
  }, [loadTrips]);

  return { trips, loading, error, loadTrips, simResult, simBusy, simulateEvent };
}
