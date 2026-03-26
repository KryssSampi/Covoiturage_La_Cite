/**
 * @file live-trips.service.ts
 * @description Fonctions pures extraites de useLiveTrips.ts pour le mapping
 *              des trajets bruts SSE vers les PublishedTrip affichables.
 *
 * Aucune dépendance React — réutilisable côté serveur ou dans d'autres hooks.
 */

import type { PublishedTrip } from "@/features/dashboard/types";
import { PublishedTripStatus } from "@/features/dashboard/types";
import { isImminent } from "@/core/utils/trip-time.utils";
export { isImminent };

// ─── Types bruts reçus via SSE ───────────────────────────────────────────────

/** Structure brute d'un trajet reçu via SSE (depuis trips.json) */
export interface RawTrip {
  id: string;
  driverId: string;
  status: string;
  departure: { label: string; coordinates?: { lat: number; lng: number } };
  arrival: { label: string; coordinates?: { lat: number; lng: number } };
  departureDate: string;
  departureTime: string;
  maxPassengers: number;
  currentPassengers: number;
  pricePerPassenger: number;
  passengerIds: string[];
  estimatedDurationMinutes?: number;
}

/** Structure brute d'une réservation reçue via SSE */
export interface RawReservation {
  id: string;
  tripId: string;
  passengerId: string;
  driverId: string;
  status: string;
}

// ─── Statuts affichés dans la section ────────────────────────────────────────

export const VISIBLE_STATUSES = new Set([
  "draft", "published", "full", "confirmed", "in_progress", "cancelled",
]);

// ─── Fonctions pures ─────────────────────────────────────────────────────────

/**
 * Mappe le statut brut du TripModel vers PublishedTripStatus.
 * Logique clé : si le statut est "confirmed" et que toutes les places sont prises → Full.
 */
export function mapStatus(trip: RawTrip, confirmedPassengerCount: number): PublishedTripStatus {
  const statusMap: Record<string, PublishedTripStatus> = {
    draft:       PublishedTripStatus.Published,
    published:   PublishedTripStatus.Published,
    full:        PublishedTripStatus.Full,
    confirmed:   PublishedTripStatus.Confirmed,
    in_progress: PublishedTripStatus.InProgress,
    completed:   PublishedTripStatus.Completed,
    cancelled:   PublishedTripStatus.Cancelled,
    no_show:     PublishedTripStatus.NoShow,
  };

  let mapped = statusMap[trip.status] ?? PublishedTripStatus.Published;

  // Logique auto-full : si passagers confirmés >= places max
  if (
    (trip.status === "confirmed" || trip.status === "published") &&
    confirmedPassengerCount >= trip.maxPassengers
  ) {
    mapped = PublishedTripStatus.Full;
  }

  return mapped;
}

/**
 * Convertit un trajet brut en PublishedTrip pour l'affichage.
 */
export function toPublishedTrip(
  trip: RawTrip,
  pendingCount: number,
  confirmedPassengerCount: number,
): PublishedTrip {
  return {
    id: trip.id,
    driverId: trip.driverId,
    departure: trip.departure.label,
    destination: trip.arrival.label,
    date: trip.departureDate,
    time: trip.departureTime,
    duration: trip.estimatedDurationMinutes ?? null,
    maxPassengers: trip.maxPassengers,
    passengers: trip.passengerIds.map((pid) => ({
      id: pid,
      pictureUrl: "",
      name: "",
      rating: 0,
      tripsCount: 0,
    })),
    price: trip.pricePerPassenger,
    pendingRequests: pendingCount,
    status: mapStatus(trip, confirmedPassengerCount),
    departureCoords: trip.departure.coordinates
      ? [trip.departure.coordinates.lat, trip.departure.coordinates.lng]
      : undefined,
    arrivalCoords: trip.arrival.coordinates
      ? [trip.arrival.coordinates.lat, trip.arrival.coordinates.lng]
      : undefined,
    isImminent: isImminent(trip),
  };
}
