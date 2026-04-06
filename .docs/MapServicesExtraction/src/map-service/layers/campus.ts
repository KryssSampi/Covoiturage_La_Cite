// ─────────────────────────────────────────────────────────────────────────────
// map-service/layers/campus.ts  — copie verbatim du site web
// ─────────────────────────────────────────────────────────────────────────────
import { ZONES_CAMPUS, CAMPUS_PERIMETER, MAP_COLORS as C, ZOOM_THRESHOLDS } from '../constants'
import { createRencontreIcon } from '../markers'
import { rencontrePopup } from '../popups'

type LMap = import('leaflet').Map
type L    = typeof import('leaflet')

export async function addCampusLayer(
  map: LMap,
  Leaflet: L,
  opts?: { showPerimeter?: boolean; showZones?: boolean; showBusStopZone?: boolean },
) {
  const showPerimeter = opts?.showPerimeter ?? true
  const showZones     = opts?.showZones     ?? true
  const showBusStop   = opts?.showBusStopZone ?? false

  if (showPerimeter) {
    const campusPoly = Leaflet.polygon(
      CAMPUS_PERIMETER.map((p) => [p.lat, p.lng] as [number, number]),
      {
        color:       C.campusBorder,
        fillColor:   C.campusFill,
        fillOpacity: 1,
        weight:      2,
        dashArray:   '6,4',
      },
    )

    map.on('zoomend', () => {
      if (map.getZoom() >= ZOOM_THRESHOLDS.campusPolygon) {
        if (!map.hasLayer(campusPoly)) campusPoly.addTo(map)
      } else {
        if (map.hasLayer(campusPoly)) campusPoly.remove()
      }
    })
    if (map.getZoom() >= ZOOM_THRESHOLDS.campusPolygon) campusPoly.addTo(map)
  }

  if (showZones) {
    const zoneMarkers: import('leaflet').Marker[] = []

    for (const zone of ZONES_CAMPUS) {
      if (!showBusStop && zone.id === 'arret-octranspo') continue
      const icon = await createRencontreIcon(zone)
      const marker = Leaflet.marker(
        [zone.coordonnees.lat, zone.coordonnees.lng],
        { icon, zIndexOffset: 50 },
      ).bindPopup(rencontrePopup(zone), { maxWidth: 220, className: 'ms-popup' })
      zoneMarkers.push(marker)
    }

    const showZoneMarkers = () => {
      const z = map.getZoom()
      zoneMarkers.forEach((m) => {
        if (z >= ZOOM_THRESHOLDS.campusZones) {
          if (!map.hasLayer(m)) m.addTo(map)
        } else {
          if (map.hasLayer(m)) m.remove()
        }
      })
    }

    map.on('zoomend', showZoneMarkers)
    showZoneMarkers()
  }
}
