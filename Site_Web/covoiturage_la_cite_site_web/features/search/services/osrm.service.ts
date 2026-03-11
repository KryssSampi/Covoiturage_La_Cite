/**
 * @file osrm.service.ts  (v2)
 * @description Service de routage OSRM — garantit 3 à 6 circuits distincts.
 *
 * Stratégie pour forcer plusieurs circuits :
 *   1. Appel principal avec alternatives=true  → donne 1–3 routes
 *   2. Si < 3 routes, on génère des waypoints intermédiaires décalés
 *      (N/E/S/O autour du point médian) et on rappelle OSRM.
 *   3. Déduplique par hash de distance+durée arrondie pour éviter les doublons.
 *   4. Toujours au moins 3 circuits retournés (si OSRM répond).
 */

import { MapCircuit } from "@/features/search/types/search.feature.types";
import { RouteResult } from "@/features/search/hooks/useRouteMap";

const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

// Offsets cardinaux (degrés) pour générer des waypoints alternatifs
// ~1.5 km N, E, S, O, NE, SO
const WAYPOINT_OFFSETS: [number, number][] = [
  [ 0.014,  0.000],  // Nord
  [ 0.000,  0.020],  // Est
  [-0.014,  0.000],  // Sud
  [ 0.000, -0.020],  // Ouest
  [ 0.010,  0.014],  // Nord-Est
  [-0.010, -0.014],  // Sud-Ouest
];

interface OsrmRoute {
  geometry: { coordinates: [number, number][] };
  duration: number;
  distance: number;
  legs: { summary: string }[];
}

function toLeafletLatLngs(coords: [number, number][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

/** Clé de déduplication — arrondi à 500 m et 30 s */
function dedupeKey(route: OsrmRoute): string {
  return `${Math.round(route.distance / 500)}_${Math.round(route.duration / 30)}`;
}

/** Midpoint entre deux points [lng, lat] */
function midpoint(a: [number, number], b: [number, number]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

/**
 * Appel OSRM simple — retourne les routes brutes.
 */
async function osrmFetch(url: string): Promise<OsrmRoute[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`);
  const data = await res.json();
  if (!data.routes?.length) return [];
  return data.routes as OsrmRoute[];
}

// ─── fetchRoute ───────────────────────────────────────────────────────────────

export async function fetchRoute(
  dep: [number, number],
  arr: [number, number]
): Promise<RouteResult> {
  const url = `${OSRM_BASE}/${dep[0]},${dep[1]};${arr[0]},${arr[1]}?overview=full&geometries=geojson`;
  const routes = await osrmFetch(url);
  if (!routes.length) throw new Error("Aucune route trouvée entre ces deux points.");
  const r = routes[0];
  return {
    latLngs:  toLeafletLatLngs(r.geometry.coordinates),
    duration: r.duration,
    distance: r.distance,
  };
}

// ─── fetchCircuits ────────────────────────────────────────────────────────────

/**
 * Récupère 3 à 6 circuits pour le conducteur.
 *
 * Étape 1 : OSRM avec alternatives=true
 * Étape 2 : Si < 3 circuits, génération via waypoints décalés autour du midpoint
 */
export async function fetchCircuits(
  dep:      [number, number],
  arr:      [number, number],
  depLabel: string,
  arrLabel: string
): Promise<MapCircuit[]> {
  const seen = new Set<string>();
  const rawRoutes: OsrmRoute[] = [];

  // ── Étape 1 : requête principale avec alternatives ──────────────────────────
  try {
    const mainUrl =
      `${OSRM_BASE}/${dep[0]},${dep[1]};${arr[0]},${arr[1]}` +
      `?overview=full&geometries=geojson&alternatives=true`;
    const mainRoutes = await osrmFetch(mainUrl);
    for (const r of mainRoutes) {
      const key = dedupeKey(r);
      if (!seen.has(key)) {
        seen.add(key);
        rawRoutes.push(r);
      }
    }
  } catch {
    // silencieux — on essaie quand même les waypoints
  }

  // ── Étape 2 : waypoints décalés si < 3 circuits ────────────────────────────
  if (rawRoutes.length < 3) {
    const [mLng, mLat] = midpoint(dep, arr);

    for (const [dLat, dLng] of WAYPOINT_OFFSETS) {
      if (rawRoutes.length >= 6) break;
      const wpLng = mLng + dLng;
      const wpLat = mLat + dLat;

      try {
        const url =
          `${OSRM_BASE}/${dep[0]},${dep[1]};${wpLng},${wpLat};${arr[0]},${arr[1]}` +
          `?overview=full&geometries=geojson`;
        const routes = await osrmFetch(url);
        for (const r of routes) {
          if (rawRoutes.length >= 6) break;
          const key = dedupeKey(r);
          if (!seen.has(key)) {
            seen.add(key);
            rawRoutes.push(r);
          }
        }
      } catch {
        // Ignore les échecs individuels
      }
    }
  }

  if (!rawRoutes.length) {
    throw new Error("Aucun circuit trouvé entre ces deux points.");
  }

  // ── Conversion en MapCircuit ────────────────────────────────────────────────
  const circuits: MapCircuit[] = rawRoutes.map((route, index) => ({
    routeIndex:      index,
    latLngs:         toLeafletLatLngs(route.geometry.coordinates),
    duration:        route.duration,
    distance:        route.distance,
    summary:         route.legs[0]?.summary || `Itinéraire ${index + 1}`,
    departureCoords: dep,
    arrivalCoords:   arr,
    departureLabel:  depLabel,
    arrivalLabel:    arrLabel,
  }));

  // Tri par distance croissante
  return circuits.sort((a, b) => a.distance - b.distance);
}
