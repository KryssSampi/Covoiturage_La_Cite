/**
 * @file useMatchingScore.ts
 * @description Algorithme de scoring de compatibilité passager ↔ trajet.
 *
 * Critères pondérés (total 100 points) :
 *   - Proximité géo départ    → max 30 pts  (exponentiel, décroît avec distance)
 *   - Proximité géo arrivée   → max 30 pts
 *   - Correspondance horaire  → max 20 pts  (±1h = 20pts, ±2h = 10pts, >3h = 0)
 *   - Note conducteur         → max 10 pts  (linéaire sur 5.0)
 *   - Places disponibles      → max 10 pts  (log, plafonné à 3)
 *
 * Convention coords : [lng, lat]
 */

import { useMemo } from "react";
import { Trip }                    from "@/features/dashboard/types/trip.types";
import { MatchingScore, TripWithCoords } from "@/features/search/types/search.feature.types";

const EARTH_R = 6_371_000;

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toR = (d: number) => (d * Math.PI) / 180;
  const dLat = toR(lat2 - lat1);
  const dLng = toR(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(a));
}

/**
 * Score géographique (0–30) décroissant exponentiellement avec la distance.
 * À 0 m → 30pts | À 300 m → ~25pts | À 1 km → ~15pts | À 5 km → ~2pts
 */
function geoScore(distMeters: number, maxPts = 30): number {
  const decay = Math.exp(-distMeters / 1000);
  return Math.round(maxPts * decay);
}

/**
 * Score horaire (0–20).
 * On compare l'heure souhaitée (si connue) avec l'heure du trajet.
 * En l'absence d'heure souhaitée, on donne le score maximal (pas de contrainte).
 */
function horaireScore(tripTime: string, desiredHour?: number): number {
  if (desiredHour === undefined) return 20;
  const [h, m] = tripTime.split(":").map(Number);
  const tripHour = h + m / 60;
  const diff = Math.abs(tripHour - desiredHour);
  if (diff <= 0.5)  return 20;
  if (diff <= 1.0)  return 16;
  if (diff <= 2.0)  return 10;
  if (diff <= 3.0)  return 4;
  return 0;
}

/** Score note conducteur (0–10), linéaire sur 5.0 */
function noteScore(rating: number): number {
  return Math.round((rating / 5.0) * 10);
}

/** Score places disponibles (0–10) */
function placesScore(available: number): number {
  if (available <= 0) return 0;
  if (available === 1) return 4;
  if (available === 2) return 7;
  return 10;
}

// ─── Types ────────────────────────────────────────────────────────────────────

// TripWithCoords est exporté depuis search.feature.types (type fusionné)

interface UseMatchingScoreParams {
  trips:            Trip[];
  departureCoords:  [number, number] | null;
  arrivalCoords:    [number, number] | null;
  desiredHour?:     number;
}

interface UseMatchingScoreResult {
  scores: Map<number, MatchingScore>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Calcule le score de matching pour chaque trajet.
 * Résultat mémoïsé.
 */
export function useMatchingScore({
  trips,
  departureCoords,
  arrivalCoords,
  desiredHour,
}: UseMatchingScoreParams): UseMatchingScoreResult {
  const scores = useMemo(() => {
    const map = new Map<number, MatchingScore>();

    for (const trip of trips) {
      const t = trip as TripWithCoords;

      // ── Géo départ ─────────────────────────────────────────────────────────
      let geoD = 30; // Score max si pas de coords (pas de pénalité)
      if (departureCoords && t.departureCoords) {
        const [pLng, pLat] = departureCoords;
        const [tLng, tLat] = t.departureCoords;
        const dist = haversine(pLat, pLng, tLat, tLng);
        geoD = geoScore(dist, 30);
      }

      // ── Géo arrivée ────────────────────────────────────────────────────────
      let geoA = 30;
      if (arrivalCoords && t.arrivalCoords) {
        const [pLng, pLat] = arrivalCoords;
        const [tLng, tLat] = t.arrivalCoords;
        const dist = haversine(pLat, pLng, tLat, tLng);
        geoA = geoScore(dist, 30);
      }

      // ── Horaire ────────────────────────────────────────────────────────────
      const hor = trip.time ? horaireScore(trip.time, desiredHour) : 20;

      // ── Note conducteur ────────────────────────────────────────────────────
      const note = noteScore(trip.driver.rating);

      // ── Places ─────────────────────────────────────────────────────────────
      const avail = trip.maxPassengers - trip.passengers.length;
      const pl = placesScore(avail);

      // ── Total ──────────────────────────────────────────────────────────────
      const total = Math.min(100, geoD + geoA + hor + note + pl);

      map.set(trip.id, {
        total,
        geoDepart:       geoD,
        geoArrivee:      geoA,
        horaire:         hor,
        noteConducteur:  note,
        places:          pl,
      });
    }

    return map;
  }, [trips, departureCoords, arrivalCoords, desiredHour]);

  return { scores };
}
