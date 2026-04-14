"use client";

/**
 * @file useLiveTrips.ts
 * @description Hook SSE pour les trajets publiés du conducteur en temps réel.
 *
 * Fonctionnement :
 * 1. Ouvre deux connexions SSE : trips + reservations
 * 2. Reçoit le contenu initial + chaque modification des fichiers JSON
 * 3. Filtre les trajets du conducteur, exclut les complétés (completed/no_show)
 * 4. Calcule le nombre de passagers confirmés et demandes en attente
 * 5. Convertit TripModel → PublishedTrip avec logique confirmed→full
 *
 * @param driverId Identifiant du conducteur connecté.
 * @returns { trips, isLoading, error, hasInProgressTrip }
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { PublishedTrip } from "@/features/dashboard/types";
import { PublishedTripStatus } from "@/features/dashboard/types";
import {
  type RawTrip,
  type RawReservation,
  VISIBLE_STATUSES,
  toPublishedTrip,
} from "@/core/services/live-trips.service";

interface UseLiveTripsResult {
  /** Trajets publiés du conducteur (sauf complétés) — null avant le premier message SSE */
  trips: PublishedTrip[] | null;
  /** Vrai uniquement avant de recevoir le tout premier message du serveur */
  isLoading: boolean;
  /** Message d'erreur si la connexion SSE a échoué */
  error: string | null;
  /** Vrai si au moins un trajet est en cours (in_progress) */
  hasInProgressTrip: boolean;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useLiveTrips(driverId: string | undefined): UseLiveTripsResult {
  const [trips, setTrips] = useState<PublishedTrip[] | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!driverId);
  const [error, setError] = useState<string | null>(null);
  const [hasInProgressTrip, setHasInProgressTrip] = useState(false);

  // Refs pour les connexions SSE
  const tripsEsRef = useRef<EventSource | null>(null);
  const reservationsEsRef = useRef<EventSource | null>(null);

  // Données brutes stockées dans des refs pour éviter les dépendances circulaires
  const rawTripsRef = useRef<RawTrip[]>([]);
  const rawReservationsRef = useRef<RawReservation[]>([]);
  const tripsRef = useRef(trips);
  useEffect(() => { tripsRef.current = trips; }, [trips]);

  /**
   * Recalcule les trajets publiés à partir des données brutes courantes.
   */
  const recalculate = useCallback(() => {
    if (!driverId) return;

    const driverTrips = rawTripsRef.current.filter(
      (t) => t.driverId === driverId && VISIBLE_STATUSES.has(t.status)
    );

    const driverReservations = rawReservationsRef.current.filter(
      (r) => r.driverId === driverId
    );

    const published = driverTrips.map((trip) => {
      const pendingCount = driverReservations.filter(
        (r) => r.tripId === trip.id && r.status === "pending"
      ).length;

      const confirmedCount = driverReservations.filter(
        (r) => r.tripId === trip.id && r.status === "confirmed"
      ).length;

      // Nombre total de passagers confirmés = passengerIds + réservations confirmées non encore dans la liste
      const totalConfirmed = Math.max(trip.passengerIds.length, confirmedCount);

      return toPublishedTrip(trip, pendingCount, totalConfirmed);
    });

    setTrips(published);
    setHasInProgressTrip(published.some((t) => t.status === PublishedTripStatus.InProgress));
    setIsLoading(false);
    setError(null);
  }, [driverId]);

  useEffect(() => {
    if (!driverId) return;

    // ── Connexion SSE pour les trajets ────────────────────────────────────
    const tripsEs = new EventSource("/api/sse/db-watch/trips");
    tripsEsRef.current = tripsEs;

    tripsEs.addEventListener("update", (event) => {
      try {
        rawTripsRef.current = JSON.parse(event.data) as RawTrip[];
        recalculate();
      } catch (err) {
        console.error("[useLiveTrips] Erreur de parsing SSE trips", err);
      }
    });

    tripsEs.addEventListener("error", () => {
      if (!tripsRef.current) {
        setError("Connexion au flux de trajets interrompue. Reconnexion en cours…");
        setIsLoading(false);
      }
    });

    // ── Connexion SSE pour les réservations ───────────────────────────────
    const reservationsEs = new EventSource("/api/sse/db-watch/reservations");
    reservationsEsRef.current = reservationsEs;

    reservationsEs.addEventListener("update", (event) => {
      try {
        rawReservationsRef.current = JSON.parse(event.data) as RawReservation[];
        recalculate();
      } catch (err) {
        console.error("[useLiveTrips] Erreur de parsing SSE reservations", err);
      }
    });

    reservationsEs.addEventListener("error", () => {
      // Les erreurs de réservations sont moins critiques — on laisse l'auto-reconnexion
    });

    // ── Nettoyage : fermeture propre des deux connexions SSE ──────────────
    return () => {
      tripsEs.close();
      reservationsEs.close();
      tripsEsRef.current = null;
      reservationsEsRef.current = null;
    };
  }, [driverId, recalculate]);

  return { trips, isLoading, error, hasInProgressTrip };
}
