'use client';

/**
 * useRealtimePositions — Consomme le SSE /api/sse/locations
 *
 * Retourne les positions temps réel du conducteur et des passagers
 * pour un trajet donné. Les deux peuvent être null si personne n'a
 * encore activé le suivi GPS.
 */

import { useEffect, useRef, useState } from 'react';

export interface PassengerPosition {
  userId: string;
  pos: { lat: number; lng: number } | null;
}

export interface RealtimePositions {
  driverPos: { lat: number; lng: number } | null;
  passengerPositions: PassengerPosition[];
  alreadyOnTheirWay: boolean;
  theyReallyEnd: boolean;
}

const INITIAL: RealtimePositions = {
  driverPos: null,
  passengerPositions: [],
  alreadyOnTheirWay: false,
  theyReallyEnd: false,
};

export function useRealtimePositions(
  tripId: string | undefined,
): RealtimePositions {
  const [positions, setPositions] = useState<RealtimePositions>(INITIAL);
  const sourceRef = useRef<EventSource | null>(null);
  const pollingRef = useRef<number | null>(null);

  useEffect(() => {
    if (!tripId) return;

    let stopped = false;

    // Polling primary: call a positions endpoint if available
    const tryFetch = async () => {
      try {
        const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/positions`);
        if (res.ok) {
          const data = (await res.json()) as RealtimePositions;
          setPositions((prev) => ({ ...prev, ...data }));
          return true;
        }
        // 404 or not implemented → fallback to SSE
        return false;
      } catch {
        return false;
      }
    };

    const startPolling = () => {
      // immediate first fetch
      void tryFetch();
      pollingRef.current = window.setInterval(() => {
        void tryFetch();
      }, 10000);
    };

    // Try polling; if the endpoint isn't available, fallback to EventSource
    (async () => {
      const ok = await tryFetch();
      if (stopped) return;
      if (ok) {
        startPolling();
      } else {
        // Fallback: EventSource on the legacy SSE path
        sourceRef.current = new EventSource(
          `/api/sse/locations?tripId=${encodeURIComponent(tripId)}`,
        );

        sourceRef.current.onmessage = (e: MessageEvent) => {
          try {
            const data = JSON.parse(e.data as string) as RealtimePositions;
            setPositions(data);
          } catch { /* ignore payload invalide */ }
        };

        sourceRef.current.onerror = () => { /* reconnexion automatique du navigateur */ };
      }
    })();

    return () => {
      stopped = true;
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      sourceRef.current?.close();
      sourceRef.current = null;
    };
  }, [tripId]);

  return positions;
}
