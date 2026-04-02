/**
 * core/services/routing.service.ts — Client routing vers le proxy ORS server-side
 *
 * Délègue TOUS les appels de routage à app/api/routing (Next.js server route).
 * La clé ORS et la boucle async waypoints restent côté serveur.
 * Le client ne connaît que /api/routing.
 *
 * ── OSRM CLIENT DÉSACTIVÉ ────────────────────────────────────────────────────
 * Ancienne implémentation (appels OSRM directs depuis le navigateur) commentée ci-dessous.
 * Ne pas supprimer — référence pour la logique de déduplication/waypoints.
 *
 * const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';
 * async function osrmFetch(url: string): Promise<OsrmRoute[]> { ... }
 * export async function fetchRoute(...) { const url = `${OSRM_BASE}/...` }
 * export async function fetchCircuits(...) { ... boucle waypoints ... }
 * ── FIN OSRM DÉSACTIVÉ ────────────────────────────────────────────────────────
 */

import type { MapCircuit } from '@/features/search/types/search.feature.types';
import type { RouteResult } from '@/features/search/hooks/useRouteMap';

const ROUTING_API = '/api/routing';

// ── fetchRoute — route simple ─────────────────────────────────────────────────

export async function fetchRoute(
  dep: [number, number],
  arr: [number, number],
): Promise<RouteResult> {
  const res = await fetch(ROUTING_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dep, arr, mode: 'simple' }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? 'Erreur serveur routing');
  }

  const data = await res.json() as { route: RouteResult };
  return data.route;
}

// ── fetchCircuits — 3 à 6 circuits pour le conducteur ────────────────────────

export async function fetchCircuits(
  dep:      [number, number],
  arr:      [number, number],
  depLabel: string,
  arrLabel: string,
): Promise<MapCircuit[]> {
  const res = await fetch(ROUTING_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dep, arr, mode: 'circuits', depLabel, arrLabel }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error ?? 'Erreur serveur circuits');
  }

  const data = await res.json() as { circuits: MapCircuit[] };
  return data.circuits;
}
