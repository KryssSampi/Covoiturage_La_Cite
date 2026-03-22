// ─────────────────────────────────────────────────────────────────────────────
// map-service/layers/overpass.ts
// Couche POI OSM via Overpass API (arrêts bus, stations-service)
// Avec debounce + cache bounding-box
// ─────────────────────────────────────────────────────────────────────────────
import type { OverpassResult, OverpassElement, BoundingBox } from '../types'
import { createBusStopIcon, createGasStationIcon } from '../markers'
import { busStopPopup, gasStationPopup } from '../popups'
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

function getBoundingBox(map: import('leaflet').Map): BoundingBox {
  const b = map.getBounds()
  return { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() }
}

// Groupes de marqueurs actifs
let _busMarkers:  import('leaflet').Marker[] = []
let _gasMarkers:  import('leaflet').Marker[] = []
let _debounceRef: ReturnType<typeof setTimeout> | null = null

/**
 * Ajoute la couche Overpass sur la carte.
 * Requête automatique sur moveend/zoomend avec debounce 600 ms + cache.
 */
export async function addOverpassLayer(
  map: import('leaflet').Map,
  Leaflet: typeof import('leaflet'),
  opts?: { showBusStops?: boolean; showGasStations?: boolean },
) {
  const showBus = opts?.showBusStops     ?? true
  const showGas = opts?.showGasStations  ?? true

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
