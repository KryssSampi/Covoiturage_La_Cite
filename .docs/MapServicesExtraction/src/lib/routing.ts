// ─────────────────────────────────────────────────────────────────────────────
// lib/routing.ts
// Service de routage OSRM — port direct de core/services/routing.service.ts
// Utilise les types locaux (pas d'imports depuis le site web)
// ─────────────────────────────────────────────────────────────────────────────
import type { MapCircuit, RouteResult } from '@/types'

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving'

const WAYPOINT_OFFSETS: [number, number][] = [
  [ 0.014,  0.000],  // Nord
  [ 0.000,  0.020],  // Est
  [-0.014,  0.000],  // Sud
  [ 0.000, -0.020],  // Ouest
  [ 0.010,  0.014],  // Nord-Est
  [-0.010, -0.014],  // Sud-Ouest
]

interface OsrmRoute {
  geometry: { coordinates: [number, number][] }
  duration: number
  distance: number
  legs: { summary: string }[]
}

function toLeafletLatLngs(coords: [number, number][]): [number, number][] {
  return coords.map(([lng, lat]) => [lat, lng])
}

function dedupeKey(route: OsrmRoute): string {
  return `${Math.round(route.distance / 500)}_${Math.round(route.duration / 30)}`
}

function midpoint(a: [number, number], b: [number, number]): [number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
}

async function osrmFetch(url: string): Promise<OsrmRoute[]> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`OSRM HTTP ${res.status}`)
  const data = await res.json()
  if (!data.routes?.length) return []
  return data.routes as OsrmRoute[]
}

export async function fetchRoute(
  dep: [number, number],
  arr: [number, number],
): Promise<RouteResult> {
  const url = `${OSRM_BASE}/${dep[0]},${dep[1]};${arr[0]},${arr[1]}?overview=full&geometries=geojson`
  const routes = await osrmFetch(url)
  if (!routes.length) throw new Error('Aucune route trouvée entre ces deux points.')
  const r = routes[0]
  return { latLngs: toLeafletLatLngs(r.geometry.coordinates), duration: r.duration, distance: r.distance }
}

export async function fetchCircuits(
  dep:      [number, number],
  arr:      [number, number],
  depLabel: string,
  arrLabel: string,
): Promise<MapCircuit[]> {
  const seen      = new Set<string>()
  const rawRoutes: Array<{ route: OsrmRoute; waypointCoords: [number, number][] }> = []

  try {
    const mainUrl = `${OSRM_BASE}/${dep[0]},${dep[1]};${arr[0]},${arr[1]}?overview=full&geometries=geojson&alternatives=true`
    for (const r of await osrmFetch(mainUrl)) {
      const key = dedupeKey(r)
      if (!seen.has(key)) { seen.add(key); rawRoutes.push({ route: r, waypointCoords: [] }) }
    }
  } catch { /* silencieux */ }

  if (rawRoutes.length < 3) {
    const [mLng, mLat] = midpoint(dep, arr)
    for (const [dLat, dLng] of WAYPOINT_OFFSETS) {
      if (rawRoutes.length >= 6) break
      try {
        const url = `${OSRM_BASE}/${dep[0]},${dep[1]};${mLng + dLng},${mLat + dLat};${arr[0]},${arr[1]}?overview=full&geometries=geojson`
        for (const r of await osrmFetch(url)) {
          if (rawRoutes.length >= 6) break
          const key = dedupeKey(r)
          if (!seen.has(key)) { seen.add(key); rawRoutes.push({ route: r, waypointCoords: [[mLng + dLng, mLat + dLat]] }) }
        }
      } catch { /* ignore */ }
    }
  }

  if (!rawRoutes.length) throw new Error('Aucun circuit trouvé entre ces deux points.')

  return rawRoutes
    .map(({ route, waypointCoords }, index) => ({
      routeIndex:      index,
      latLngs:         toLeafletLatLngs(route.geometry.coordinates),
      waypointCoords,
      duration:        route.duration,
      distance:        route.distance,
      summary:         route.legs[0]?.summary || `Itinéraire ${index + 1}`,
      departureCoords: dep,
      arrivalCoords:   arr,
      departureLabel:  depLabel,
      arrivalLabel:    arrLabel,
    }))
    .sort((a, b) => a.distance - b.distance)
}
