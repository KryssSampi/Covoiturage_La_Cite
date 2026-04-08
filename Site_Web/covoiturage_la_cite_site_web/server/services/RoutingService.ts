/**
 * server/services/RoutingService.ts
 *
 * Calcul d'itinéraires via ORS (OpenRouteService) avec fallback synthétique.
 * Utilisé uniquement côté serveur (clé ORS jamais exposée au client).
 */

// ── Config ────────────────────────────────────────────────────────────────────

const ORS_BASE = (process.env.OPEN_ROUTES_SERVICE_URL ?? 'https://api.openrouteservice.org/v2/directions/driving-car').replace(/\/geojson$/, '');
const ORS_URL  = `${ORS_BASE}/geojson`;
const ORS_KEY  = process.env.OPEN_ROUTES_SERVICE_KEY ?? '';

const MAX_CIRCUITS = 6;

const WAYPOINT_OFFSETS: [number, number][] = [
  [ 0.014,  0.000],
  [ 0.000,  0.020],
  [-0.014,  0.000],
  [ 0.000, -0.020],
  [ 0.010,  0.014],
  [-0.010, -0.014],
];

const SYNTHETIC_OFFSETS: [number, number][] = [
  [ 0,      0    ],
  [ 0.012,  0    ],
  [-0.012,  0    ],
  [ 0,      0.018],
  [ 0.008,  0.012],
  [-0.008, -0.012],
];

// ── Types publics ─────────────────────────────────────────────────────────────

export interface SimpleRoute {
  latLngs:  [number, number][];
  distance: number;
  duration: number;
}

export interface CircuitRoute extends SimpleRoute {
  routeIndex:      number;
  waypointCoords:  [number, number][];
  summary:         string;
  departureCoords: [number, number];
  arrivalCoords:   [number, number];
  departureLabel:  string;
  arrivalLabel:    string;
}

// ── Types internes ORS ────────────────────────────────────────────────────────

interface OrsRoute {
  geometry: { coordinates: [number, number][] };
  summary:  { distance: number; duration: number };
}

interface OrsGeoJsonResponse {
  features: Array<{
    geometry:   { coordinates: [number, number][] };
    properties: { summary: { distance: number; duration: number } };
  }>;
}

// ── Géométrie synthétique ─────────────────────────────────────────────────────

function haversineDistance(dep: [number, number], arr: [number, number]): number {
  const R = 6371000;
  const dLat = (arr[1] - dep[1]) * Math.PI / 180;
  const dLng = (arr[0] - dep[0]) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(dep[1] * Math.PI / 180) * Math.cos(arr[1] * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function interpolate(a: [number, number], b: [number, number], steps = 10): [number, number][] {
  return Array.from({ length: steps + 1 }, (_, i) => {
    const t = i / steps;
    return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t] as [number, number];
  });
}

function toLatLngs(coords: [number, number][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

function buildSynthetic(dep: [number, number], arr: [number, number], dLat = 0, dLng = 0): SimpleRoute {
  const distance = haversineDistance(dep, arr) * 1.25;
  const duration = distance / 13.9;
  const mid: [number, number] = [(dep[0] + arr[0]) / 2 + dLng, (dep[1] + arr[1]) / 2 + dLat];
  const coords = dLat === 0 && dLng === 0
    ? interpolate(dep, arr)
    : [...interpolate(dep, mid, 5), ...interpolate(mid, arr, 5)];
  return { latLngs: toLatLngs(coords), distance, duration };
}

// ── Client ORS ────────────────────────────────────────────────────────────────

async function orsPost(coordinates: [number, number][], alternatives = false): Promise<OrsRoute[] | null> {
  if (!ORS_KEY) return null;
  try {
    const res = await fetch(ORS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': ORS_KEY,
        'Accept': 'application/json, application/geo+json',
      },
      body: JSON.stringify({
        coordinates,
        instructions: false,
        geometry: true,
        alternative_routes: alternatives ? { target_count: MAX_CIRCUITS, weight_factor: 1.4 } : undefined,
      }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) { console.warn(`[ORS] ${res.status}`); return null; }
    const data = (await res.json()) as OrsGeoJsonResponse;
    return (data.features ?? [])
      .filter(f => Array.isArray(f.geometry?.coordinates))
      .map(f => ({ geometry: f.geometry, summary: f.properties.summary }));
  } catch {
    return null;
  }
}

function dedupeKey(r: OrsRoute) {
  return `${Math.round(r.summary.distance / 500)}_${Math.round(r.summary.duration / 30)}`;
}

function midpoint(a: [number, number], b: [number, number]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

// ── API publique ──────────────────────────────────────────────────────────────

export const RoutingService = {

  async getSimpleRoute(dep: [number, number], arr: [number, number]): Promise<SimpleRoute> {
    const routes = await orsPost([dep, arr]);
    if (routes?.length) {
      const r = routes[0];
      return { latLngs: toLatLngs(r.geometry.coordinates), duration: r.summary.duration, distance: r.summary.distance };
    }
    return buildSynthetic(dep, arr);
  },

  async getCircuits(
    dep: [number, number],
    arr: [number, number],
    depLabel = 'Départ',
    arrLabel = 'Arrivée',
  ): Promise<CircuitRoute[]> {
    const seen      = new Set<string>();
    const collected: OrsRoute[] = [];

    // 1 — alternatives ORS (jusqu'à MAX_CIRCUITS en une requête)
    const main = await orsPost([dep, arr], true);
    if (main) {
      for (const r of main) {
        const k = dedupeKey(r);
        if (!seen.has(k)) { seen.add(k); collected.push(r); }
      }
    }

    // 2 — waypoints séquentiels pour compléter
    if (collected.length < MAX_CIRCUITS) {
      const mid = midpoint(dep, arr);
      for (const [dLat, dLng] of WAYPOINT_OFFSETS) {
        if (collected.length >= MAX_CIRCUITS) break;
        const wp: [number, number] = [mid[0] + dLng, mid[1] + dLat];
        const routes = await orsPost([dep, wp, arr]);
        if (!routes) break;
        for (const r of routes) {
          if (collected.length >= MAX_CIRCUITS) break;
          const k = dedupeKey(r);
          if (!seen.has(k)) { seen.add(k); collected.push(r); }
        }
      }
    }

    // 3 — compléter avec synthétique
    for (let i = collected.length; i < MAX_CIRCUITS; i++) {
      const [dLat, dLng] = SYNTHETIC_OFFSETS[i] ?? [0, 0];
      const s = buildSynthetic(dep, arr, dLat, dLng);
      collected.push({
        geometry: { coordinates: toLatLngs(s.latLngs).map(([lat, lng]) => [lng, lat] as [number, number]) },
        summary:  { distance: s.distance * (1 + i * 0.08), duration: s.duration * (1 + i * 0.05) },
      });
    }

    return collected.map((r, index) => ({
      routeIndex:      index,
      latLngs:         toLatLngs(r.geometry.coordinates),
      waypointCoords:  [] as [number, number][],
      duration:        r.summary.duration,
      distance:        r.summary.distance,
      summary:         `Itinéraire ${index + 1}`,
      departureCoords: dep,
      arrivalCoords:   arr,
      departureLabel:  depLabel,
      arrivalLabel:    arrLabel,
    }));
  },
};
