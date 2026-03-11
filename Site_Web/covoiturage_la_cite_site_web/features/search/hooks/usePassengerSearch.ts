/**
 * @file usePassengerSearch.ts  (v3)
 * @description Hook de recherche, filtrage et tri pour les passagers.
 *
 * Algorithme en 3 étapes :
 *   1. Calcul du score de matching (0–100) pour CHAQUE trajet de la liste
 *   2. Filtrage du sous-ensemble : géo + prix + places + nom conducteur
 *   3. Tri selon la clé choisie (matching, prix, départ, places)
 *
 * Corrections vs v2 :
 *   - mergedFilters déplacé DANS le useMemo pour éviter la clôture obsolète
 *   - Dep array simplifié : on référence filters (stable object ref géré par l'appelant)
 *     + chaque prop individuelle pour garantir la réactivité
 *   - Filtre statuses ajouté (se déclenche uniquement si le trip possède un champ status)
 *   - Cohérence geo score ↔ geo filter : quand aucune coord n'est fournie,
 *     le score est neutre (15/30) plutôt que maximal pour éviter la fausse discrimination
 */

import { useMemo } from "react";
import { Trip }    from "@/features/dashboard/types/trip.types";
import {
  SearchFilters,
  PassengerSortKey,
  DEFAULT_SEARCH_FILTERS,
  MatchingScore,
} from "@/features/search/types/search.feature.types";

// ─── Fonctions géographiques ──────────────────────────────────────────────────

const EARTH_R = 6_371_000;

/** Distance en mètres entre deux points géographiques via la formule de Haversine */
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
 * Score géographique exponentiel (0–maxPts).
 * À 0 m   → maxPts  |  À 500 m  → ~18 pts  |  À 1 km  → ~11 pts  |  À 5 km → ~1 pt
 */
function geoScore(distMeters: number, maxPts = 30): number {
  return Math.round(maxPts * Math.exp(-distMeters / 1000));
}

/**
 * Score horaire (0–20).
 * Si aucune heure souhaitée → score neutre (10/20, pas de contrainte).
 * ±30 min → 20 | ±1h → 16 | ±2h → 10 | ±3h → 4 | >3h → 0
 */
function horaireScore(tripTime: string, desiredHour?: number): number {
  if (desiredHour === undefined) return 10;
  const [h, m] = tripTime.split(":").map(Number);
  const diff = Math.abs(h + m / 60 - desiredHour);
  if (diff <= 0.5) return 20;
  if (diff <= 1.0) return 16;
  if (diff <= 2.0) return 10;
  if (diff <= 3.0) return 4;
  return 0;
}

// ─── Extension du type Trip avec coordonnées (présentes dans les fixtures) ────

type TripWithCoords = Trip & {
  departureCoords?: [number, number]; // [lng, lat]
  arrivalCoords?:   [number, number]; // [lng, lat]
  status?:          string;           // Champ optionnel pour le filtre statuses
};

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface UsePassengerSearchParams {
  /** Liste complète des trajets à filtrer */
  trips:            Trip[];
  /** Coordonnées du départ recherché [lng, lat] — null si non renseigné */
  departureCoords:  [number, number] | null;
  /** Coordonnées de l'arrivée recherchée [lng, lat] — null si non renseigné */
  arrivalCoords:    [number, number] | null;
  /** Filtres actifs (fusionnés avec DEFAULT_SEARCH_FILTERS) */
  filters?:         Partial<SearchFilters>;
  /** Clé de tri active */
  sortKey?:         PassengerSortKey;
  /** Heure souhaitée (0–23.99) pour le score horaire */
  desiredHour?:     number;
}

interface UsePassengerSearchResult {
  /** Trajets après filtrage et tri */
  filteredTrips:  Trip[];
  /** Nombre total de trajets (avant filtrage) */
  totalCount:     number;
  /** Map trip.id → score de matching calculé */
  scores:         Map<number, MatchingScore>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function usePassengerSearch({
  trips,
  departureCoords,
  arrivalCoords,
  filters     = {},
  sortKey     = "matching_desc",
  desiredHour,
}: UsePassengerSearchParams): UsePassengerSearchResult {

  const { filteredTrips, scores } = useMemo(() => {

    // Fusion des filtres DANS le memo pour éviter une clôture obsolète
    const merged: SearchFilters = { ...DEFAULT_SEARCH_FILTERS, ...filters };

    const scoreMap = new Map<number, MatchingScore>();

    // ── 1. Calcul du score de matching pour tous les trajets ──────────────────
    for (const trip of trips) {
      const t = trip as TripWithCoords;

      // Geo départ : score neutre (15) si aucune coord fournie
      let geoD = 15;
      if (departureCoords && t.departureCoords) {
        const [pLng, pLat] = departureCoords;
        const [tLng, tLat] = t.departureCoords;
        geoD = geoScore(haversine(pLat, pLng, tLat, tLng), 30);
      }

      // Geo arrivée : score neutre (15) si aucune coord fournie
      let geoA = 15;
      if (arrivalCoords && t.arrivalCoords) {
        const [pLng, pLat] = arrivalCoords;
        const [tLng, tLat] = t.arrivalCoords;
        geoA = geoScore(haversine(pLat, pLng, tLat, tLng), 30);
      }

      // Score horaire (neutre si pas de contrainte)
      const hor = trip.time ? horaireScore(trip.time, desiredHour) : 10;

      // Note conducteur → 0–10 pts (linéaire sur 5.0)
      const note = Math.round((trip.driver.rating / 5.0) * 10);

      // Places disponibles → 0 | 4 | 7 | 10 pts
      const avail = trip.maxPassengers - trip.passengers.length;
      const pl    = avail <= 0 ? 0 : avail === 1 ? 4 : avail === 2 ? 7 : 10;

      const total = Math.min(100, geoD + geoA + hor + note + pl);
      scoreMap.set(trip.id, {
        total,
        geoDepart:      geoD,
        geoArrivee:     geoA,
        horaire:        hor,
        noteConducteur: note,
        places:         pl,
      });
    }

    // ── 2. Filtrage ───────────────────────────────────────────────────────────

    let result = [...trips].filter((trip) => {
      const t = trip as TripWithCoords;

      // Filtre géographique (seulement si coordonnées ET champ présent)
      if (departureCoords && t.departureCoords) {
        const [pLng, pLat] = departureCoords;
        const [tLng, tLat] = t.departureCoords;
        if (haversine(pLat, pLng, tLat, tLng) > merged.departureRadiusMeters) return false;
      }
      if (arrivalCoords && t.arrivalCoords) {
        const [pLng, pLat] = arrivalCoords;
        const [tLng, tLat] = t.arrivalCoords;
        if (haversine(pLat, pLng, tLat, tLng) > merged.arrivalRadiusMeters) return false;
      }

      // Filtre prix maximum
      if (merged.maxPrice !== undefined && trip.price > merged.maxPrice) return false;

      // Filtre places minimum disponibles
      if (
        merged.minSeatsAvailable !== undefined &&
        trip.maxPassengers - trip.passengers.length < merged.minSeatsAvailable
      ) return false;

      // Filtre sur le nom du conducteur (recherche partielle insensible à la casse)
      if (merged.driverName?.trim()) {
        const needle = merged.driverName.trim().toLowerCase();
        if (!trip.driver.name.toLowerCase().includes(needle)) return false;
      }

      // Filtre statuses (appliqué si le trajet possède un champ status)
      if (merged.statuses?.length && t.status) {
        if (!merged.statuses.includes(t.status)) return false;
      }

      return true;
    });

    // ── 3. Tri ────────────────────────────────────────────────────────────────
    switch (sortKey) {
      case "matching_desc":
        // Tri par score de matching décroissant, puis par prix croissant à égalité
        result.sort((a, b) => {
          const dScore = (scoreMap.get(b.id)?.total ?? 0) - (scoreMap.get(a.id)?.total ?? 0);
          return dScore !== 0 ? dScore : a.price - b.price;
        });
        break;
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "departure_asc":
        result.sort((a, b) => {
          const dA = new Date(`${a.date}T${a.time || "00:00"}`).getTime();
          const dB = new Date(`${b.date}T${b.time || "00:00"}`).getTime();
          return dA - dB;
        });
        break;
      case "seats_desc":
        result.sort(
          (a, b) =>
            (b.maxPassengers - b.passengers.length) -
            (a.maxPassengers - a.passengers.length)
        );
        break;
    }

    return { filteredTrips: result, scores: scoreMap };

  // Dépendances : trips (référence), coords, chaque prop de filtre individuellement, tri, heure
  }, [
    trips,
    departureCoords,
    arrivalCoords,
    filters.departureRadiusMeters,
    filters.arrivalRadiusMeters,
    filters.maxPrice,
    filters.minSeatsAvailable,
    filters.driverName,
    filters.statuses,
    sortKey,
    desiredHour,
  ]);

  return { filteredTrips, totalCount: trips.length, scores };
}
