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

  useEffect(() => {
    if (!tripId) return;

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

    return () => {
      sourceRef.current?.close();
      sourceRef.current = null;
    };
  }, [tripId]);

  return positions;
}
