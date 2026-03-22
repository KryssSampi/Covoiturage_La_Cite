// ─────────────────────────────────────────────────────────────────────────────
// features/trajet-en-cours/fixtures/map.fixtures.ts
// Coordonnées GPS réelles : Campus La Cité → Place d'Orléans
// Route réelle via Montréal Road / Hwy 174 (Ottawa)
// ─────────────────────────────────────────────────────────────────────────────
import type { TrajetMapFixture, LatLng } from '../types/map.types'

// ── Utilitaire distance Haversine (mètres) ──────────────────────────────────
export function haversineM(a: LatLng, b: LatLng): number {
  const R = 6_371_000
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const sinLat = Math.sin(dLat / 2)
  const sinLng = Math.sin(dLng / 2)
  const h =
    sinLat * sinLat +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      sinLng * sinLng
  return 2 * R * Math.asin(Math.sqrt(h))
}

// ── Calcul du cap entre deux points (degrés, 0 = Nord) ──────────────────────
export function bearingDeg(a: LatLng, b: LatLng): number {
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const y = Math.sin(dLng) * Math.cos(lat2)
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

// ── Distance totale d'une polyline ──────────────────────────────────────────
export function polylineDistanceM(pts: LatLng[]): number {
  let total = 0
  for (let i = 0; i < pts.length - 1; i++) {
    total += haversineM(pts[i], pts[i + 1])
  }
  return total
}

// ── Interpolation linéaire sur la polyline ──────────────────────────────────
/**
 * Retourne la LatLng et le cap pour une distance parcourue donnée (mètres)
 * sur la polyline fournie.
 */
export function interpolateOnPolyline(
  pts: LatLng[],
  distM: number,
): { latlng: LatLng; heading: number } {
  let remaining = Math.max(0, distM)
  for (let i = 0; i < pts.length - 1; i++) {
    const segDist = haversineM(pts[i], pts[i + 1])
    if (remaining <= segDist || i === pts.length - 2) {
      const ratio = segDist > 0 ? Math.min(remaining / segDist, 1) : 0
      return {
        latlng: {
          lat: pts[i].lat + ratio * (pts[i + 1].lat - pts[i].lat),
          lng: pts[i].lng + ratio * (pts[i + 1].lng - pts[i].lng),
        },
        heading: bearingDeg(pts[i], pts[i + 1]),
      }
    }
    remaining -= segDist
  }
  return { latlng: pts[pts.length - 1], heading: 90 }
}

// ═══════════════════════════════════════════════════════════════════════════
// FIXTURE PRINCIPALE : Campus La Cité → Place d'Orléans (route réelle)
// Via promenade de l'Aviation → Beechwood → Montreal Road → Hwy 174
// ═══════════════════════════════════════════════════════════════════════════
const POLYLINE_CAMPUS_ORLEANS: LatLng[] = [
  // Campus La Cité — départ
  { lat: 45.4215, lng: -75.6830 },
  // Sortie campus vers promenade de l'Aviation
  { lat: 45.4222, lng: -75.6798 },
  { lat: 45.4228, lng: -75.6760 },
  // Avenue Hemlock → chemin Montreal
  { lat: 45.4238, lng: -75.6720 },
  { lat: 45.4245, lng: -75.6680 },
  // Beechwood / Vanier area
  { lat: 45.4252, lng: -75.6635 },
  { lat: 45.4260, lng: -75.6590 },
  { lat: 45.4268, lng: -75.6545 },
  // Chemin Montreal Road vers l'est
  { lat: 45.4278, lng: -75.6498 },
  { lat: 45.4288, lng: -75.6450 },
  { lat: 45.4296, lng: -75.6405 },
  { lat: 45.4302, lng: -75.6358 },
  { lat: 45.4308, lng: -75.6310 },
  { lat: 45.4315, lng: -75.6262 },
  { lat: 45.4320, lng: -75.6215 },
  // Gloucester — jonction Hwy 174
  { lat: 45.4325, lng: -75.6165 },
  { lat: 45.4330, lng: -75.6112 },
  { lat: 45.4336, lng: -75.6060 },
  { lat: 45.4342, lng: -75.6005 },
  // Blackburn Hamlet area
  { lat: 45.4350, lng: -75.5948 },
  { lat: 45.4360, lng: -75.5890 },
  { lat: 45.4370, lng: -75.5830 },
  { lat: 45.4382, lng: -75.5768 },
  // Hwy 174 en direction Orléans
  { lat: 45.4398, lng: -75.5705 },
  { lat: 45.4415, lng: -75.5642 },
  { lat: 45.4432, lng: -75.5580 },
  { lat: 45.4450, lng: -75.5518 },
  { lat: 45.4468, lng: -75.5458 },
  { lat: 45.4485, lng: -75.5398 },
  { lat: 45.4502, lng: -75.5340 },
  { lat: 45.4518, lng: -75.5285 },
  { lat: 45.4535, lng: -75.5258 },
  { lat: 45.4555, lng: -75.5238 },
  { lat: 45.4572, lng: -75.5225 },
  // Place d'Orléans — arrivée
  { lat: 45.4590, lng: -75.5210 },
]

export const fixtureMapPrincipale: TrajetMapFixture = {
  id: 'MAP-TRJ-2026-08842',
  label: 'Campus La Cité → Place d\'Orléans',
  depart:   { lat: 45.4215, lng: -75.6830 },
  arrivee:  { lat: 45.4590, lng: -75.5210 },
  labelDepart:  'Campus La Cité',
  labelArrivee: 'Place d\'Orléans',
  vitesseMoyenneKmh: 50,
  polyline: POLYLINE_CAMPUS_ORLEANS,
  distanceTotaleM: polylineDistanceM(POLYLINE_CAMPUS_ORLEANS),
}

// ═══════════════════════════════════════════════════════════════════════════
// GÉNÉRATEUR de fixture aléatoire (Ottawa area)
// Utilisé pour générer le prochain trajet quand il reste ~1 min
// ═══════════════════════════════════════════════════════════════════════════
const LIEUX_OTTAWA: Array<{ label: string; latlng: LatLng }> = [
  { label: 'Campus La Cité',      latlng: { lat: 45.4215, lng: -75.6830 } },
  { label: 'Place d\'Orléans',    latlng: { lat: 45.4590, lng: -75.5210 } },
  { label: 'Barrhaven Centre',    latlng: { lat: 45.2760, lng: -75.7580 } },
  { label: 'Kanata Nord',         latlng: { lat: 45.3602, lng: -75.9120 } },
  { label: 'Byward Market',       latlng: { lat: 45.4268, lng: -75.6923 } },
  { label: 'Westboro',            latlng: { lat: 45.3980, lng: -75.7608 } },
  { label: 'Nepean Centrum',      latlng: { lat: 45.3430, lng: -75.7720 } },
  { label: 'Gloucester Centre',   latlng: { lat: 45.3992, lng: -75.6178 } },
  { label: 'Gatineau Hull',       latlng: { lat: 45.4216, lng: -75.7006 } },
  { label: 'South Keys',          latlng: { lat: 45.3680, lng: -75.6550 } },
]

/**
 * Appelle l'API OSRM pour obtenir une polyline suivant les vraies routes.
 * Retourne null en cas d'échec (réseau, pas de route trouvée, etc.).
 */
async function fetchOsrmPolyline(
  dep: LatLng,
  arr: LatLng,
): Promise<LatLng[] | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${dep.lng},${dep.lat};${arr.lng},${arr.lat}` +
      `?overview=full&geometries=geojson`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json() as {
      routes?: Array<{ geometry: { coordinates: number[][] } }>
    }
    const coords = data.routes?.[0]?.geometry?.coordinates
    if (!coords || coords.length < 2) return null
    return coords.map(([lng, lat]) => ({ lat, lng }))
  } catch {
    return null
  }
}

/** Fallback synchrone : ligne droite interpolée si OSRM échoue */
function genPolylineFallback(dep: LatLng, arr: LatLng, nPts = 18): LatLng[] {
  const pts: LatLng[] = []
  for (let i = 0; i <= nPts; i++) {
    const t = i / nPts
    pts.push({
      lat: dep.lat + t * (arr.lat - dep.lat),
      lng: dep.lng + t * (arr.lng - dep.lng),
    })
  }
  return pts
}

/**
 * Génère une nouvelle fixture aléatoire avec polyline OSRM (route réelle).
 * Utilise un fallback en ligne droite si l'appel OSRM échoue.
 */
export async function genererNouvelleFixtureMap(
  exclureDepId?: string,
): Promise<TrajetMapFixture> {
  const lieux = LIEUX_OTTAWA.filter((l) => l.label !== exclureDepId)
  const depIdx = Math.floor(Math.random() * lieux.length)
  let arrIdx = Math.floor(Math.random() * lieux.length)
  while (arrIdx === depIdx) arrIdx = Math.floor(Math.random() * lieux.length)

  const dep = lieux[depIdx]
  const arr = lieux[arrIdx]

  // Tente d'obtenir un itinéraire via OSRM, fallback sur ligne droite
  const osrmPoly = await fetchOsrmPolyline(dep.latlng, arr.latlng)
  const poly = osrmPoly ?? genPolylineFallback(dep.latlng, arr.latlng, 20)

  return {
    id: `MAP-RAND-${Date.now()}`,
    label: `${dep.label} → ${arr.label}`,
    depart:          dep.latlng,
    arrivee:         arr.latlng,
    labelDepart:     dep.label,
    labelArrivee:    arr.label,
    vitesseMoyenneKmh: 40 + Math.floor(Math.random() * 30), // 40–70 km/h
    polyline:        poly,
    distanceTotaleM: polylineDistanceM(poly),
  }
}
