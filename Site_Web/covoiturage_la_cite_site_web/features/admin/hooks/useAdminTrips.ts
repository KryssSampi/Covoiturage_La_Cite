/**
 * Hook useAdminTrips — Charge la liste enrichie de tous les trajets
 * depuis la route GET /api/admin/trips.
 *
 * Offre aussi :
 *  - triggerSimulation : déclencher un événement de simulation (pénalités, annulation…)
 *  - startAutoplay     : simulation GPS progressive à 50 km/h le long de la polyline
 *  - stopAutoplay      : arrêt de la simulation GPS pour un trajet donné
 */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { AdminTrip, SimulateResult, SimulationEvent } from "@/features/admin/types/adminTrips";

// ── Utilitaire : distance haversine en mètres ────────────────────────────────
function haversineM(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6_371_000;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lng - a.lng) * Math.PI) / 180;
  const aa =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
}

// ── Pré-calcul de N positions équidistantes le long d'une polyline ───────────
function samplePolyline(
  polyline: [number, number][],
  steps: number,
): { lat: number; lng: number }[] {
  if (polyline.length < 2) {
    return polyline.map(([lat, lng]) => ({ lat, lng }));
  }

  // Distances cumulées
  const cum: number[] = [0];
  for (let i = 1; i < polyline.length; i++) {
    cum.push(cum[i - 1] + haversineM(
      { lat: polyline[i - 1][0], lng: polyline[i - 1][1] },
      { lat: polyline[i][0], lng: polyline[i][1] },
    ));
  }
  const total = cum[cum.length - 1];

  const result: { lat: number; lng: number }[] = [];
  for (let s = 0; s <= steps; s++) {
    const target = total * s / steps;
    let i = 1;
    while (i < cum.length - 1 && cum[i] < target) i++;
    const segLen = cum[i] - cum[i - 1];
    const frac = segLen > 0 ? (target - cum[i - 1]) / segLen : 0;
    const lat = polyline[i - 1][0] + frac * (polyline[i][0] - polyline[i - 1][0]);
    const lng = polyline[i - 1][1] + frac * (polyline[i][1] - polyline[i - 1][1]);
    result.push({ lat, lng });
  }
  return result;
}

// ── Types exportés ────────────────────────────────────────────────────────────
export type AutoplayState = 'running' | 'done' | 'error';

export function useAdminTrips() {
  const [trips, setTrips]           = useState<AdminTrip[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [simResult, setSimResult]   = useState<SimulateResult | null>(null);
  const [simBusy, setSimBusy]       = useState(false);
  const [autoplayStates, setAutoplayStates] = useState<Record<string, AutoplayState>>({});
  const [autoplayProgress, setAutoplayProgress] = useState<Record<string, number>>({});

  // intervalId par tripId
  const autoplayRefs = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadTrips();
  }, [loadTrips]);

  // ── Simulation d'événement (pénalités, annulations…) ─────────────────────
  const triggerSimulation = useCallback(async (
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
      setSimResult({ success: false, event, tripId, message: (err as Error).message, affectedReservations: 0 });
    } finally {
      setSimBusy(false);
    }
  }, [loadTrips]);

  // ── Simulation GPS autoplay ───────────────────────────────────────────────
  const stopAutoplay = useCallback((tripId: string) => {
    const id = autoplayRefs.current.get(tripId);
    if (id !== undefined) {
      clearInterval(id);
      autoplayRefs.current.delete(tripId);
    }
    // Retire le flag simControlActive côté serveur
    void fetch(`/api/admin/simulate/autoplay?tripId=${encodeURIComponent(tripId)}`, {
      method: "DELETE",
    });
    setAutoplayStates((prev) => { const n = { ...prev }; delete n[tripId]; return n; });
    setAutoplayProgress((prev) => { const n = { ...prev }; delete n[tripId]; return n; });
  }, []);

  const startAutoplay = useCallback(async (trip: AdminTrip) => {
    const tripId = trip.id;

    // Stop any running autoplay for this trip first
    stopAutoplay(tripId);

    setAutoplayStates((prev) => ({ ...prev, [tripId]: 'running' }));
    setAutoplayProgress((prev) => ({ ...prev, [tripId]: 0 }));

    try {
      // 1. Initialise la simulation côté serveur
      const initRes = await fetch("/api/admin/simulate/autoplay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });
      if (!initRes.ok) {
        setAutoplayStates((prev) => ({ ...prev, [tripId]: 'error' }));
        return;
      }

      const initData = await initRes.json() as {
        driverId: string;
        polyline: [number, number][];
        departure?: { coordinates?: { lat: number; lng: number } };
        arrival?: { coordinates?: { lat: number; lng: number } };
      };

      const driverId = initData.driverId;
      let polyline   = initData.polyline ?? [];

      // Fallback polyline depuis departure/arrival si absente
      if (polyline.length < 2) {
        const dep = initData.departure?.coordinates ?? trip.departure?.coordinates;
        const arr = initData.arrival?.coordinates  ?? trip.arrival?.coordinates;
        if (dep && arr) {
          polyline = [[dep.lat, dep.lng], [arr.lat, arr.lng]];
        } else {
          setAutoplayStates((prev) => ({ ...prev, [tripId]: 'error' }));
          return;
        }
      }

      // 2. Pré-calcule 20 positions équidistantes
      const STEPS = 20;
      const positions = samplePolyline(polyline, STEPS);
      let stepIdx = 0;

      // 3. Intervalle 2 s — poste une position à chaque tick
      const intervalId = setInterval(async () => {
        if (stepIdx >= positions.length) {
          clearInterval(intervalId);
          autoplayRefs.current.delete(tripId);
          setAutoplayStates((prev) => ({ ...prev, [tripId]: 'done' }));
          await loadTrips();
          return;
        }

        const { lat, lng } = positions[stepIdx];
        stepIdx++;

        setAutoplayProgress((prev) => ({
          ...prev,
          [tripId]: Math.round((stepIdx / positions.length) * 100),
        }));

        await fetch("/api/locations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: driverId, lat, lng, tripId, isSimulation: true }),
        });
      }, 2000);

      autoplayRefs.current.set(tripId, intervalId);
    } catch (err) {
      console.error("[useAdminTrips]", err);
      setAutoplayStates((prev) => ({ ...prev, [tripId]: 'error' }));
    }
  }, [stopAutoplay, loadTrips]);

  const simulateEvent = triggerSimulation;

  return {
    trips,
    loading,
    error,
    loadTrips,
    simResult,
    simBusy,
    triggerSimulation,
    simulateEvent,
    startAutoplay,
    stopAutoplay,
    autoplayStates,
    autoplayProgress,
  };
}
