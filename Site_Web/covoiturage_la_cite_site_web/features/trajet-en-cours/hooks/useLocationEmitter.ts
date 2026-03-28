'use client';

/**
 * useLocationEmitter — Émetteur GPS temps réel
 *
 * Surveille la position via navigator.geolocation.watchPosition et envoie
 * les coordonnées au serveur (/api/locations) à un rythme optimal :
 *   - Minimum 4 s entre deux envois (évite le spam)
 *   - Maximum 8 s (heartbeat de position si l'utilisateur ne bouge pas)
 *   - High accuracy activé pour la meilleure précision GPS
 *
 * À activer uniquement quand l'utilisateur est sur la page trajet-en-cours.
 */

import { useEffect, useRef } from 'react';

const MIN_INTERVAL_MS = 4_000;  // au plus une mise à jour toutes les 4 s
const MAX_INTERVAL_MS = 8_000;  // heartbeat toutes les 8 s max

export function useLocationEmitter(
  userId: string | undefined,
  tripId: string | undefined,
  enabled: boolean,
): void {
  const lastEmitRef  = useRef<number>(0);
  const watchIdRef   = useRef<number | null>(null);
  const heartbeatRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastPosRef   = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!enabled || !userId || !tripId) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) return;

    function emit(lat: number, lng: number) {
      lastPosRef.current = { lat, lng };
      lastEmitRef.current = Date.now();
      void fetch('/api/locations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, lat, lng, tripId }),
      });
    }

    // Heartbeat : réémet la dernière position connue si rien de nouveau
    heartbeatRef.current = setInterval(() => {
      const pos = lastPosRef.current;
      if (!pos) return;
      if (Date.now() - lastEmitRef.current >= MAX_INTERVAL_MS) {
        emit(pos.lat, pos.lng);
      }
    }, MAX_INTERVAL_MS);

    // Surveillance GPS continues
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude: lat, longitude: lng } = position.coords;
        if (Date.now() - lastEmitRef.current < MIN_INTERVAL_MS) return;
        emit(lat, lng);
      },
      () => { /* Erreur silencieuse — le heartbeat prend le relais */ },
      { enableHighAccuracy: true, maximumAge: 3_000, timeout: 5_000 },
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (heartbeatRef.current !== null) {
        clearInterval(heartbeatRef.current);
        heartbeatRef.current = null;
      }
    };
  }, [enabled, userId, tripId]);
}
