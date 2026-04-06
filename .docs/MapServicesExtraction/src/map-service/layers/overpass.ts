// ─────────────────────────────────────────────────────────────────────────────
// map-service/layers/overpass.ts
//
// Stratégie cache-tuile + visibilité viewport :
//   • La carte est découpée en tuiles de TILE_DEG (~10 km)
//   • Chaque tuile est fetchée une seule fois depuis Overpass, puis mise en cache
//     pour toute la durée de la session (les bâtiments ne bougent pas 😄)
//   • À chaque moveend/zoomend on collecte les éléments des tuiles visibles,
//     on filtre par bounds exactes + seuil de zoom, et on swap les markers
//   • Swap atomique : nouveaux markers ajoutés AVANT suppression des anciens
//     → zéro clignotement
//   • Les icônes sont créées une seule fois et mises en cache
// ─────────────────────────────────────────────────────────────────────────────
import type { OverpassResult, OverpassElement, BoundingBox } from '../types'
import { createBusStopIcon, createGasStationIcon, createPublicServiceIcon } from '../markers'
import type { PublicServiceType } from '../markers'
import { busStopPopup, gasStationPopup, publicServicePopup } from '../popups'
import { ZOOM_THRESHOLDS } from '../constants'

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter'

// Taille d'une tuile en degrés (~33 km à 45° de latitude)
// 0.1 générait ~27 requêtes Overpass simultanées au zoom 13 → rate-limit sur les tuiles centrales
const TILE_DEG = 0.3

// ── Caches ────────────────────────────────────────────────────────────────────

// Données POI : "category:latTile,lngTile" → éléments Overpass
const _dataCache = new Map<string, OverpassElement[]>()

// Requêtes en vol : évite les doubles-fetch si moveend arrive pendant un fetch
const _inFlight  = new Map<string, Promise<OverpassElement[]>>()

// Icônes Leaflet : créées une seule fois par type
const _iconCache = new Map<string, import('leaflet').Icon | import('leaflet').DivIcon>()

// Markers actifs (viewport courante uniquement)
let _busMarkers:    import('leaflet').Marker[] = []
let _gasMarkers:    import('leaflet').Marker[] = []
let _publicMarkers: import('leaflet').Marker[] = []
let _debounceRef:   ReturnType<typeof setTimeout> | null = null

// ── Helpers tuiles ────────────────────────────────────────────────────────────

function tileOrigin(v: number): number {
  return +( Math.floor(v / TILE_DEG) * TILE_DEG ).toFixed(6)
}

/** Retourne les coins SW de toutes les tuiles qui couvrent la bounding box. */
function tilesFor(bb: BoundingBox): Array<[number, number]> {
  const tiles: Array<[number, number]> = []
  for (let lat = tileOrigin(bb.south); lat <= bb.north; lat = +(lat + TILE_DEG).toFixed(6)) {
    for (let lng = tileOrigin(bb.west); lng <= bb.east; lng = +(lng + TILE_DEG).toFixed(6)) {
      tiles.push([+lat.toFixed(1), +lng.toFixed(1)])
    }
  }
  return tiles
}

function inBounds(lat: number, lon: number, bb: BoundingBox): boolean {
  return lat >= bb.south && lat <= bb.north && lon >= bb.west && lon <= bb.east
}

// ── Fetch Overpass ─────────────────────────────────────────────────────────────

async function queryOverpass(query: string): Promise<OverpassElement[]> {
  try {
    const res = await fetch(OVERPASS_ENDPOINT, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    `data=${encodeURIComponent(query)}`,
    })
    if (!res.ok) return []
    const data: OverpassResult = await res.json()
    return data.elements ?? []
  } catch { return [] }
}

/**
 * Retourne les éléments d'une tuile.
 * Fetch uniquement si la tuile n'est pas déjà en cache ou en cours de fetch.
 */
async function ensureTile(
  category: string,
  tileLat:  number,
  tileLng:  number,
  queryFn:  (bb: BoundingBox) => string,
): Promise<OverpassElement[]> {
  const key = `${category}:${tileLat},${tileLng}`
  if (_dataCache.has(key)) return _dataCache.get(key)!
  if (_inFlight.has(key))  return _inFlight.get(key)!

  const tileBb: BoundingBox = {
    south: tileLat,
    north: +(tileLat + TILE_DEG).toFixed(6),
    west:  tileLng,
    east:  +(tileLng + TILE_DEG).toFixed(6),
  }

  const promise = queryOverpass(queryFn(tileBb)).then((elements) => {
    _dataCache.set(key, elements)
    _inFlight.delete(key)
    return elements
  }).catch(() => {
    _inFlight.delete(key) // permet une nouvelle tentative au prochain mouvement
    return [] as OverpassElement[]
  })

  _inFlight.set(key, promise)
  return promise
}

// ── Cache icônes ──────────────────────────────────────────────────────────────

async function getIcon<T extends import('leaflet').Icon | import('leaflet').DivIcon>(
  key:    string,
  create: () => Promise<T>,
): Promise<T> {
  if (_iconCache.has(key)) return _iconCache.get(key) as T
  const icon = await create()
  _iconCache.set(key, icon)
  return icon
}

// ── Helpers POI ───────────────────────────────────────────────────────────────

function getCoords(el: OverpassElement): { lat: number; lon: number } | null {
  if (typeof el.lat === 'number' && typeof el.lon === 'number') return { lat: el.lat, lon: el.lon }
  if (el.center?.lat && el.center?.lon) return { lat: el.center.lat, lon: el.center.lon }
  return null
}

function getPublicType(tags?: Record<string, string>): string | null {
  if (!tags) return null
  const a = tags['amenity'], b = tags['building']
  if (a === 'hospital'  || a === 'clinic')                                          return 'hospital'
  if (a === 'school'    || a === 'college' || a === 'university')                   return 'school'
  if (a === 'library')          return 'library'
  if (a === 'townhall')         return 'townhall'
  if (a === 'police')           return 'police'
  if (a === 'fire_station')     return 'fire_station'
  if (a === 'community_centre') return 'community_centre'
  if (a === 'courthouse')       return 'courthouse'
  if (a === 'public_building' || b === 'public') return 'public_building'
  return null
}

// ── Requêtes Overpass par catégorie ───────────────────────────────────────────

const BUS_QUERY    = (bb: BoundingBox) =>
  `[out:json][timeout:10];\nnode["highway"="bus_stop"](${bb.south},${bb.west},${bb.north},${bb.east});\nout body;`

const GAS_QUERY    = (bb: BoundingBox) =>
  `[out:json][timeout:10];\nnode["amenity"="fuel"](${bb.south},${bb.west},${bb.north},${bb.east});\nout body;`

const PUBLIC_QUERY = (bb: BoundingBox) =>
  `[out:json][timeout:12];\n(\n` +
  `node["amenity"~"school|college|university|hospital|clinic|library|townhall|police|fire_station|community_centre|public_building|courthouse"](${bb.south},${bb.west},${bb.north},${bb.east});\n` +
  `way["amenity"~"school|college|university|hospital|clinic|library|townhall|police|fire_station|community_centre|public_building|courthouse"](${bb.south},${bb.west},${bb.north},${bb.east});\n` +
  `node["building"="public"](${bb.south},${bb.west},${bb.north},${bb.east});\n` +
  `way["building"="public"](${bb.south},${bb.west},${bb.north},${bb.east});\n` +
  `);\nout center;`

// ── Export principal ──────────────────────────────────────────────────────────

export async function addOverpassLayer(
  map:     import('leaflet').Map,
  Leaflet: typeof import('leaflet'),
  opts?:   { showBusStops?: boolean; showGasStations?: boolean; showPublicServices?: boolean },
) {
  const showBus    = opts?.showBusStops       ?? false
  const showGas    = opts?.showGasStations    ?? true
  const showPublic = opts?.showPublicServices ?? true

  const getBoundingBox = (): BoundingBox => {
    const b = map.getBounds()
    return { south: b.getSouth(), west: b.getWest(), north: b.getNorth(), east: b.getEast() }
  }

  const refreshPOIs = async () => {
    const z     = map.getZoom()
    const bb    = getBoundingBox()
    const tiles = tilesFor(bb)

    // ── Bus stops ──────────────────────────────────────────────────────────
    if (showBus) {
      if (z < ZOOM_THRESHOLDS.busStops) {
        _busMarkers.forEach((m) => m.remove()); _busMarkers = []
      } else {
        const elements = (await Promise.all(
          tiles.map(([lat, lng]) => ensureTile('bus', lat, lng, BUS_QUERY))
        )).flat()

        const visible = elements.filter((el) => el.lat && el.lon && inBounds(el.lat, el.lon, bb))
        const icon    = await getIcon('bus', createBusStopIcon)
        const next    = visible.map((el) => {
          const nom    = el.tags?.['name'] ?? el.tags?.['ref'] ?? 'Arrêt'
          const lignes = el.tags?.['route_ref'] ?? el.tags?.['network:short']
          return Leaflet.marker([el.lat!, el.lon!], { icon, zIndexOffset: 20 })
            .bindPopup(busStopPopup(nom, lignes), { maxWidth: 200, className: 'ms-popup' })
            .addTo(map)
        })
        _busMarkers.forEach((m) => m.remove())
        _busMarkers = next
      }
    }

    // ── Stations-service ───────────────────────────────────────────────────
    if (showGas) {
      if (z < ZOOM_THRESHOLDS.gasStations) {
        _gasMarkers.forEach((m) => m.remove()); _gasMarkers = []
      } else {
        const elements = (await Promise.all(
          tiles.map(([lat, lng]) => ensureTile('gas', lat, lng, GAS_QUERY))
        )).flat()

        const visible = elements.filter((el) => el.lat && el.lon && inBounds(el.lat, el.lon, bb))
        const icon    = await getIcon('gas', createGasStationIcon)
        const next    = visible.map((el) =>
          Leaflet.marker([el.lat!, el.lon!], { icon, zIndexOffset: 10 })
            .bindPopup(gasStationPopup(el.tags?.['name'] ?? 'Station-service'), { maxWidth: 200, className: 'ms-popup' })
            .addTo(map)
        )
        _gasMarkers.forEach((m) => m.remove())
        _gasMarkers = next
      }
    }

    // ── Services publics ───────────────────────────────────────────────────
    if (showPublic) {
      if (z < ZOOM_THRESHOLDS.publicServices) {
        _publicMarkers.forEach((m) => m.remove()); _publicMarkers = []
      } else {
        const elements = (await Promise.all(
          tiles.map(([lat, lng]) => ensureTile('public', lat, lng, PUBLIC_QUERY))
        )).flat()

        const visible = elements.filter((el) => {
          const c = getCoords(el); return c ? inBounds(c.lat, c.lon, bb) : false
        })

        // Pré-créer toutes les icônes nécessaires en parallèle
        const neededTypes = [...new Set(
          visible.map((el) => getPublicType(el.tags)).filter(Boolean)
        )] as PublicServiceType[]
        await Promise.all(
          neededTypes.map((t) => getIcon(`public:${t}`, () => createPublicServiceIcon(t)))
        )

        const next: import('leaflet').Marker[] = []
        for (const el of visible) {
          const coords = getCoords(el);               if (!coords) continue
          const type   = getPublicType(el.tags);      if (!type)   continue
          const icon   = _iconCache.get(`public:${type}`); if (!icon) continue
          next.push(
            Leaflet.marker([coords.lat, coords.lon], { icon, zIndexOffset: 5 })
              .bindPopup(publicServicePopup(type, el.tags?.['name'] ?? ''), { maxWidth: 220, className: 'ms-popup' })
              .addTo(map)
          )
        }
        _publicMarkers.forEach((m) => m.remove())
        _publicMarkers = next
      }
    }
  }

  const debouncedRefresh = () => {
    if (_debounceRef) clearTimeout(_debounceRef)
    _debounceRef = setTimeout(refreshPOIs, 400)
  }

  map.on('moveend', debouncedRefresh)
  map.on('zoomend', debouncedRefresh)
  await refreshPOIs()
}
