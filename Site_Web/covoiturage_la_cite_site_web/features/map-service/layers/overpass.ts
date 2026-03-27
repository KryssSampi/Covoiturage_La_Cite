// ─────────────────────────────────────────────────────────────────────────────
// map-service/layers/overpass.ts
// Couche POI OSM via Overpass API (arrêts bus, stations-service)
// Avec debounce + cache bounding-box
// ─────────────────────────────────────────────────────────────────────────────
import type { OverpassResult, OverpassElement, BoundingBox } from '../types'
import { createBusStopIcon, createGasStationIcon, createPublicServiceIcon } from '../markers'
import { busStopPopup, gasStationPopup, publicServicePopup } from '../popups'
import { ZOOM_THRESHOLDS } from '../constants'

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter'

// Cache : clé = bbox stringifiée arrondie à 2 décimales
const _cache = new Map<string, OverpassElement[]>()

function bboxKey(bb: BoundingBox): string {
  return [bb.south, bb.west, bb.north, bb.east].map((v) => v.toFixed(2)).join(',')
}

async function queryOverpass(query: string): Promise<OverpassElement[]> {
  try {
    const res = await fetch(OVERPASS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `data=${encodeURIComponent(query)}`,
    })
    if (!res.ok) return []
    const data: OverpassResult = await res.json()
    return data.elements ?? []
  } catch { return [] }
}

// Renvoie le bounding box de la carte si elle est prête, sinon un box vide (évite les erreurs runtime)
function getBoundingBox(map: import('leaflet').Map): BoundingBox {
  // Vérifie que map est bien défini et monté
  if (!map || typeof map.getBounds !== 'function') {
    // Valeurs par défaut (Ottawa centre) pour éviter le crash
    return { south: 45.4, west: -75.7, north: 45.5, east: -75.6 };
  }
  const b = map.getBounds();
  return { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() };
}

// Groupes de marqueurs actifs
let _busMarkers:    import('leaflet').Marker[] = []
let _gasMarkers:    import('leaflet').Marker[] = []
let _publicMarkers: import('leaflet').Marker[] = []
let _debounceRef: ReturnType<typeof setTimeout> | null = null

/**
 * Ajoute la couche Overpass sur la carte.
 * Requête automatique sur moveend/zoomend avec debounce 600 ms + cache.
 */
export async function addOverpassLayer(
  map: import('leaflet').Map,
  Leaflet: typeof import('leaflet'),
  opts?: { showBusStops?: boolean; showGasStations?: boolean; showPublicServices?: boolean },
) {
  const showBus     = opts?.showBusStops      ?? false
  const showGas     = opts?.showGasStations   ?? true
  const showPublic  = opts?.showPublicServices ?? true

  const getCoords = (el: OverpassElement): { lat: number; lon: number } | null => {
    if (typeof el.lat === 'number' && typeof el.lon === 'number') return { lat: el.lat, lon: el.lon }
    if (el.center?.lat && el.center?.lon) return { lat: el.center.lat, lon: el.center.lon }
    return null
  }

  const getPublicType = (tags?: Record<string, string>): string | null => {
    if (!tags) return null
    const amenity = tags['amenity']
    const building = tags['building']

    if (amenity === 'hospital' || amenity === 'clinic') return 'hospital'
    if (amenity === 'school' || amenity === 'college' || amenity === 'university') return 'school'
    if (amenity === 'library') return 'library'
    if (amenity === 'townhall') return 'townhall'
    if (amenity === 'police') return 'police'
    if (amenity === 'fire_station') return 'fire_station'
    if (amenity === 'community_centre') return 'community_centre'
    if (amenity === 'courthouse') return 'courthouse'
    if (amenity === 'public_building') return 'public_building'
    if (building === 'public') return 'public_building'
    return null
  }

  const refreshPOIs = async () => {
    const z = map.getZoom()

    // ── Arrêts bus ─────────────────────────────────────────────────────────
    if (showBus) {
      if (z < ZOOM_THRESHOLDS.busStops) {
        _busMarkers.forEach((m) => m.remove())
        _busMarkers = []
      } else {
        const bb  = getBoundingBox(map)
        const key = `bus:${bboxKey(bb)}`

        let elements = _cache.get(key)
        if (!elements) {
          const q = `[out:json][timeout:10];
node["highway"="bus_stop"](${bb.south},${bb.west},${bb.north},${bb.east});
out body;`
          elements = await queryOverpass(q)
          _cache.set(key, elements)
        }

        _busMarkers.forEach((m) => m.remove())
        _busMarkers = []
        const icon = await createBusStopIcon()
        for (const el of elements) {
          if (!el.lat || !el.lon) continue
          const nom    = el.tags?.['name'] ?? el.tags?.['ref'] ?? 'Arrêt'
          const lignes = el.tags?.['route_ref'] ?? el.tags?.['network:short']
          const m = Leaflet.marker([el.lat, el.lon], { icon, zIndexOffset: 20 })
            .bindPopup(busStopPopup(nom, lignes), { maxWidth: 200, className: 'ms-popup' })
            .addTo(map)
          _busMarkers.push(m)
        }
      }
    }

    // ── Stations-service ───────────────────────────────────────────────────
    if (showGas) {
      if (z < ZOOM_THRESHOLDS.gasStations) {
        _gasMarkers.forEach((m) => m.remove())
        _gasMarkers = []
      } else {
        const bb  = getBoundingBox(map)
        const key = `gas:${bboxKey(bb)}`

        let elements = _cache.get(key)
        if (!elements) {
          const q = `[out:json][timeout:10];
node["amenity"="fuel"](${bb.south},${bb.west},${bb.north},${bb.east});
out body;`
          elements = await queryOverpass(q)
          _cache.set(key, elements)
        }

        _gasMarkers.forEach((m) => m.remove())
        _gasMarkers = []
        const icon = await createGasStationIcon()
        for (const el of elements) {
          if (!el.lat || !el.lon) continue
          const nom = el.tags?.['name'] ?? 'Station-service'
          const m = Leaflet.marker([el.lat, el.lon], { icon, zIndexOffset: 10 })
            .bindPopup(gasStationPopup(nom), { maxWidth: 200, className: 'ms-popup' })
            .addTo(map)
          _gasMarkers.push(m)
        }
      }
    }

    // â”€â”€ BÃ¢timents publics â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (showPublic) {
      if (z < ZOOM_THRESHOLDS.publicServices) {
        _publicMarkers.forEach((m) => m.remove())
        _publicMarkers = []
      } else {
        const bb  = getBoundingBox(map)
        const key = `public:${bboxKey(bb)}`

        let elements = _cache.get(key)
        if (!elements) {
          const q = `[out:json][timeout:12];
(
node["amenity"~"school|college|university|hospital|clinic|library|townhall|police|fire_station|community_centre|public_building|courthouse"](${bb.south},${bb.west},${bb.north},${bb.east});
way["amenity"~"school|college|university|hospital|clinic|library|townhall|police|fire_station|community_centre|public_building|courthouse"](${bb.south},${bb.west},${bb.north},${bb.east});
node["building"="public"](${bb.south},${bb.west},${bb.north},${bb.east});
way["building"="public"](${bb.south},${bb.west},${bb.north},${bb.east});
);
out center;`
          elements = await queryOverpass(q)
          _cache.set(key, elements)
        }

        _publicMarkers.forEach((m) => m.remove())
        _publicMarkers = []

        for (const el of elements) {
          const coords = getCoords(el)
          if (!coords) continue
          const type = getPublicType(el.tags)
          if (!type) continue
          const nom = el.tags?.['name'] ?? ''
          const icon = await createPublicServiceIcon(type as import('@/features/map-service/markers/index').PublicServiceType)
          const m = Leaflet.marker([coords.lat, coords.lon], { icon, zIndexOffset: 5 })
            .bindPopup(publicServicePopup(type, nom), { maxWidth: 220, className: 'ms-popup' })
            .addTo(map)
          _publicMarkers.push(m)
        }
      }
    }
  }

  // Debounce sur moveend + zoomend
  const debouncedRefresh = () => {
    if (_debounceRef) clearTimeout(_debounceRef)
    _debounceRef = setTimeout(refreshPOIs, 600)
  }

  map.on('moveend', debouncedRefresh)
  map.on('zoomend', debouncedRefresh)

  // Premier chargement
  await refreshPOIs()
}
