/**
 * @file routing.service.ts
 * @description Service de routage — OpenRouteService (ORS)
 *
 * Stratégie pour obtenir plusieurs circuits :
 *   1. Requête principale avec alternative_routes (jusqu'à 3)
 *   2. Si < 3 routes, waypoints intermédiaires décalés (N/E/S/O autour du midpoint)
 *   3. Déduplique par hash distance+durée arrondie
 */

import type { MapCircuit } from '@/features/search/types/search.feature.types';
import type { RouteResult } from '@/features/search/hooks/useRouteMap';

const ORS_BASE = process.env.NEXT_PUBLIC_OPEN_ROUTES_SERVICE_URL
  ?? process.env.OPEN_ROUTES_SERVICE_URL
  ?? 'https://api.openrouteservice.org/v2/directions/driving-car';
const ORS_KEY  = process.env.NEXT_PUBLIC_OPEN_ROUTES_SERVICE_KEY
  ?? process.env.OPEN_ROUTES_SERVICE_KEY
  ?? '';

// Offsets cardinaux (degrés) pour waypoints alternatifs — ~1.5 km
const WAYPOINT_OFFSETS: [number, number][] = [
  [ 0.014,  0.000],  // Nord
  [ 0.000,  0.020],  // Est
  [-0.014,  0.000],  // Sud
  [ 0.000, -0.020],  // Ouest
  [ 0.010,  0.014],  // Nord-Est
  [-0.010, -0.014],  // Sud-Ouest
];

// ─── Types ORS ─────────────────────────────────────────────────────────────────

interface OrsFeature {
  type: 'Feature';
  properties: {
    summary:  { distance: number; duration: number };
    segments: Array<{ steps: Array<{ name: string }> }>;
  };
  geometry: {
    type: 'LineString';
    coordinates: [number, number][]; // [lng, lat]
  };
}

interface OrsGeoJson {
  type:     'FeatureCollection';
  features: OrsFeature[];
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function toLeafletLatLngs(coords: [number, number][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

/** Clé de déduplication — arrondi à 500 m et 30 s */
function dedupeKey(f: OrsFeature): string {
  const { distance, duration } = f.properties.summary;
  return `${Math.round(distance / 500)}_${Math.round(duration / 30)}`;
}

function midpoint(a: [number, number], b: [number, number]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

// ─── Fetch ORS ─────────────────────────────────────────────────────────────────

async function orsFetch(
  coordinates: [number, number][],
  withAlternatives = false,
): Promise<OrsFeature[]> {
  const body: Record<string, unknown> = { coordinates };
  if (withAlternatives) {
    body.alternative_routes = { target_count: 3, weight_factor: 1.4, share_factor: 0.6 };
  }

  const label = coordinates.map(c => c.join(",")).join(" → ");
  console.log("[ORS →]", label, withAlternatives ? "(alternatives)" : "");

  const res = await fetch(`${ORS_BASE}/geojson`, {
    method:  'POST',
    headers: {
      'Authorization': ORS_KEY,
      'Content-Type':  'application/json',
      'Accept':        'application/geo+json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("[ORS ✗]", res.status, detail);
    throw new Error(`ORS HTTP ${res.status}`);
  }

  const data: OrsGeoJson = await res.json();
  const count = data.features?.length ?? 0;
  console.log("[ORS ←]", count, "route(s)");
  return data.features ?? [];
}

// ─── fetchRoute — route simple (utilisé par useRouteMap) ───────────────────────

export async function fetchRoute(
  dep: [number, number],
  arr: [number, number],
): Promise<RouteResult> {
  const features = await orsFetch([dep, arr]);
  if (!features.length) throw new Error('Aucune route trouvée entre ces deux points.');
  const f = features[0];
  return {
    latLngs:  toLeafletLatLngs(f.geometry.coordinates),
    duration: f.properties.summary.duration,
    distance: f.properties.summary.distance,
  };
}

// ─── fetchCircuits — 3 à 6 circuits pour le conducteur ─────────────────────────

export async function fetchCircuits(
  dep:      [number, number],
  arr:      [number, number],
  depLabel: string,
  arrLabel: string,
): Promise<MapCircuit[]> {
  const seen = new Set<string>();
  const raw: Array<{ feature: OrsFeature; waypointCoords: [number, number][] }> = [];

  // Étape 1 : requête principale avec alternatives (jusqu'à 3)
  try {
    for (const f of await orsFetch([dep, arr], true)) {
      const key = dedupeKey(f);
      if (!seen.has(key)) { seen.add(key); raw.push({ feature: f, waypointCoords: [] }); }
    }
  } catch { /* silencieux — on tente les waypoints */ }

  // Étape 2 : waypoints décalés si < 3 circuits
  if (raw.length < 3) {
    const [mLng, mLat] = midpoint(dep, arr);
    for (const [dLat, dLng] of WAYPOINT_OFFSETS) {
      if (raw.length >= 6) break;
      try {
        const wp: [number, number] = [mLng + dLng, mLat + dLat];
        for (const f of await orsFetch([dep, wp, arr])) {
          if (raw.length >= 6) break;
          const key = dedupeKey(f);
          if (!seen.has(key)) { seen.add(key); raw.push({ feature: f, waypointCoords: [wp] }); }
        }
      } catch { /* ignore les échecs individuels */ }
    }
  }

  if (!raw.length) throw new Error('Aucun circuit trouvé entre ces deux points.');

  return raw
    .map(({ feature: f, waypointCoords }, index) => ({
      routeIndex:      index,
      latLngs:         toLeafletLatLngs(f.geometry.coordinates),
      waypointCoords,
      duration:        f.properties.summary.duration,
      distance:        f.properties.summary.distance,
      summary:         f.properties.segments[0]?.steps[0]?.name || `Itinéraire ${index + 1}`,
      departureCoords: dep,
      arrivalCoords:   arr,
      departureLabel:  depLabel,
      arrivalLabel:    arrLabel,
    }))
    .sort((a, b) => a.distance - b.distance);
}
