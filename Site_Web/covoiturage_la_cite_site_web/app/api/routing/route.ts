/**
 * app/api/routing/route.ts — Proxy ORS server-side
 *
 * Remplace les appels OSRM directs depuis le client.
 * La clé ORS reste côté serveur (OPEN_ROUTES_SERVICE_KEY dans .env).
 * Toute la logique de boucle async (alternatives + waypoints décalés) se fait ici.
 *
 * Usage client :
 *   POST /api/routing
 *   Body: { dep: [lng, lat], arr: [lng, lat], mode: 'simple' | 'circuits', depLabel?: string, arrLabel?: string }
 */

import { NextResponse } from 'next/server';

const ORS_URL = process.env.OPEN_ROUTES_SERVICE_URL ?? 'https://api.openrouteservice.org/v2/directions/driving-car';
const ORS_KEY = process.env.OPEN_ROUTES_SERVICE_KEY ?? '';

// Offsets cardinaux (~1.5 km) pour générer des circuits alternatifs
const WAYPOINT_OFFSETS: [number, number][] = [
  [ 0.014,  0.000],  // Nord
  [ 0.000,  0.020],  // Est
  [-0.014,  0.000],  // Sud
  [ 0.000, -0.020],  // Ouest
  [ 0.010,  0.014],  // Nord-Est
  [-0.010, -0.014],  // Sud-Ouest
];

// ── Types ORS ─────────────────────────────────────────────────────────────────

interface OrsRoute {
  geometry: { coordinates: [number, number][] };
  summary: { distance: number; duration: number };
  segments: { distance: number; duration: number }[];
}

interface OrsResponse {
  routes: OrsRoute[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function orsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': ORS_KEY,
    'Accept': 'application/json, application/geo+json',
  };
}

function dedupeKey(r: OrsRoute): string {
  return `${Math.round(r.summary.distance / 500)}_${Math.round(r.summary.duration / 30)}`;
}

function midpoint(a: [number, number], b: [number, number]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
}

function toLatLngs(coords: [number, number][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng]);
}

async function orsPost(coordinates: [number, number][], alternatives = false): Promise<OrsRoute[]> {
  const body = {
    coordinates,
    instructions: false,
    geometry: true,
    alternative_routes: alternatives ? { target_count: 3, weight_factor: 1.6 } : undefined,
  };
  const res = await fetch(ORS_URL, {
    method: 'POST',
    headers: orsHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text().catch(() => '');
    throw new Error(`ORS ${res.status}: ${err}`);
  }
  const data = (await res.json()) as OrsResponse;
  return data.routes ?? [];
}

// ── Route simple ──────────────────────────────────────────────────────────────

async function routeSimple(dep: [number, number], arr: [number, number]) {
  const routes = await orsPost([dep, arr]);
  if (!routes.length) throw new Error('Aucune route ORS trouvée');
  const r = routes[0];
  return {
    latLngs:  toLatLngs(r.geometry.coordinates),
    duration: r.summary.duration,
    distance: r.summary.distance,
  };
}

// ── Circuits (boucle async waypoints) ────────────────────────────────────────

async function routeCircuits(
  dep: [number, number],
  arr: [number, number],
  depLabel: string,
  arrLabel: string,
) {
  const seen      = new Set<string>();
  const collected: Array<{ route: OrsRoute; waypointCoords: [number, number][] }> = [];

  // Étape 1 — requête principale avec alternatives
  try {
    for (const r of await orsPost([dep, arr], true)) {
      const key = dedupeKey(r);
      if (!seen.has(key)) { seen.add(key); collected.push({ route: r, waypointCoords: [] }); }
    }
  } catch { /* continue vers waypoints */ }

  // Étape 2 — boucle async waypoints décalés jusqu'à 6 circuits
  if (collected.length < 3) {
    const mid = midpoint(dep, arr);
    const requests = WAYPOINT_OFFSETS.map(([dLat, dLng]) =>
      orsPost([dep, [mid[0] + dLng, mid[1] + dLat], arr])
        .then(routes => ({ routes, waypointCoords: [[mid[0] + dLng, mid[1] + dLat]] as [number, number][] }))
        .catch(() => null)
    );

    // Lance toutes les requêtes en parallèle, collecte au fur et à mesure
    const results = await Promise.allSettled(requests);
    for (const result of results) {
      if (collected.length >= 6) break;
      if (result.status !== 'fulfilled' || !result.value) continue;
      const { routes, waypointCoords } = result.value;
      for (const r of routes) {
        if (collected.length >= 6) break;
        const key = dedupeKey(r);
        if (!seen.has(key)) { seen.add(key); collected.push({ route: r, waypointCoords }); }
      }
    }
  }

  if (!collected.length) throw new Error('Aucun circuit ORS trouvé');

  return collected
    .map(({ route: r, waypointCoords }, index) => ({
      routeIndex:      index,
      latLngs:         toLatLngs(r.geometry.coordinates),
      waypointCoords,
      duration:        r.summary.duration,
      distance:        r.summary.distance,
      summary:         `Itinéraire ${index + 1}`,
      departureCoords: dep,
      arrivalCoords:   arr,
      departureLabel:  depLabel,
      arrivalLabel:    arrLabel,
    }))
    .sort((a, b) => a.distance - b.distance);
}

// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = await req.json() as {
      dep: [number, number];
      arr: [number, number];
      mode?: 'simple' | 'circuits';
      depLabel?: string;
      arrLabel?: string;
    };

    const { dep, arr, mode = 'simple', depLabel = 'Départ', arrLabel = 'Arrivée' } = body;

    if (!dep || !arr || dep.length < 2 || arr.length < 2) {
      return NextResponse.json({ error: 'dep et arr requis ([lng, lat])' }, { status: 400 });
    }

    if (mode === 'circuits') {
      const circuits = await routeCircuits(dep, arr, depLabel, arrLabel);
      return NextResponse.json({ circuits });
    }

    const route = await routeSimple(dep, arr);
    return NextResponse.json({ route });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur routing';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
