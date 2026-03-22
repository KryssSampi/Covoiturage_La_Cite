// ─────────────────────────────────────────────────────────────────────────────
// map-service/layers/campus.ts
// Couche campus : polygone périmètre + zones internes (marqueurs)
// ─────────────────────────────────────────────────────────────────────────────
import { ZONES_CAMPUS, CAMPUS_PERIMETER, MAP_COLORS as C, ZOOM_THRESHOLDS } from '../constants'
import { createRencontreIcon } from '../markers'
import { rencontrePopup } from '../popups'

type LMap = import('leaflet').Map
type L    = typeof import('leaflet')

/**
 * Ajoute la couche campus La Cité à la carte.
 * - Polygone du campus (bleu 6 % opacity, contour tiretté) à partir du zoom 13
 * - Marqueurs des 7 zones internes à partir du zoom 15
 */
export async function addCampusLayer(
  map: LMap,
  Leaflet: L,
  opts?: { showPerimeter?: boolean; showZones?: boolean },
) {
  const showPerimeter = opts?.showPerimeter ?? true
  const showZones     = opts?.showZones     ?? true

  // ── Polygone du campus ──────────────────────────────────────────────────
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

  // ── Marqueurs zones internes ────────────────────────────────────────────
  if (showZones) {
    const zoneMarkers: import('leaflet').Marker[] = []

    for (const zone of ZONES_CAMPUS) {
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
