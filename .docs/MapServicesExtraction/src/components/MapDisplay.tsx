'use client'
// ─────────────────────────────────────────────────────────────────────────────
// components/MapDisplay.tsx
// Carte Leaflet plein écran — affiche circuits, marqueurs, layers campus/POI
// Écoute les messages bridge entrants, émet les messages sortants
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useCallback } from 'react'
import type { MapCircuit, MapConfig } from '@/types'
import {
  TILE_CONFIGS, POLYLINE_STYLES, MAP_COLORS,
  injectMapServiceCSS,
  addCampusLayer,
  addOverpassLayer,
  initOffScreenButtons,
  destroyOffScreenButtons,
  DEFAULT_MAP_SERVICE_CONFIG,
  createDepartIcon,
  createArriveeIcon,
} from '@/map-service'
import { sendToBridge } from '@/lib/bridge'

interface Props {
  circuits:      MapCircuit[]
  activeIndex:   number
  config:        MapConfig
  onCircuitClick:(index: number) => void
}

export default function MapDisplay({ circuits, activeIndex, config, onCircuitClick }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null)
  const mapRef        = useRef<import('leaflet').Map | null>(null)
  const tileLayerRef  = useRef<import('leaflet').TileLayer | null>(null)
  // Polylines actives : une par circuit
  const polylinesRef  = useRef<import('leaflet').Polyline[]>([])
  // Marqueurs départ/arrivée
  const depMarkerRef  = useRef<import('leaflet').Marker | null>(null)
  const arrMarkerRef  = useRef<import('leaflet').Marker | null>(null)

  // ── Init carte (une seule fois) ────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    injectMapServiceCSS()

    let cancelled = false;

    (async () => {
      const L = await import('leaflet')
      if (cancelled || !containerRef.current) return

      // Fix icônes Leaflet avec Next.js (bug classique)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      })

      // Centré sur Ottawa / campus La Cité par défaut
      const map = L.map(containerRef.current, {
        center:   [45.4395, -75.6268],
        zoom:     13,
        zoomControl: true,
      })

      mapRef.current = map

      // Tile layer
      const tileConf = TILE_CONFIGS[config.tileProvider]
      const tile = L.tileLayer(tileConf.url, {
        attribution: tileConf.attribution,
        subdomains:  (tileConf.subdomains ?? '') as string,
        maxZoom:     tileConf.maxZoom,
      }).addTo(map)
      tileLayerRef.current = tile

      // Click sur la carte → bridge
      map.on('click', (e) => {
        sendToBridge({ type: 'MAP_CLICK', lat: e.latlng.lat, lng: e.latlng.lng })
      })

      // Couche campus
      if (config.showCampusZones) {
        await addCampusLayer(map, L, { showPerimeter: true, showZones: true })
      }

      // Couche Overpass (POI)
      await addOverpassLayer(map, L, {
        showBusStops:       config.showBusStops,
        showGasStations:    config.showGasStations,
        showPublicServices: config.showPublicServices,
      })

      // Bouton off-screen campus
      initOffScreenButtons(
        containerRef.current!,
        map,
        DEFAULT_MAP_SERVICE_CONFIG.offScreenTargets,
        (target) => {
          map.flyTo([target.coordonnees.lat, target.coordonnees.lng], 15, { animate: true, duration: 1.2 })
        },
      )

      // Signal MAP_READY
      sendToBridge({ type: 'MAP_READY' })
    })()

    return () => {
      cancelled = true
      destroyOffScreenButtons()
      mapRef.current?.remove()
      mapRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // init une seule fois

  // ── Mise à jour tile provider ─────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    ;(async () => {
      const L = await import('leaflet')
      if (tileLayerRef.current) { tileLayerRef.current.remove(); tileLayerRef.current = null }
      const tileConf = TILE_CONFIGS[config.tileProvider]
      tileLayerRef.current = L.tileLayer(tileConf.url, {
        attribution: tileConf.attribution,
        subdomains:  (tileConf.subdomains ?? '') as string,
        maxZoom:     tileConf.maxZoom,
      }).addTo(map)
    })()
  }, [config.tileProvider])

  // ── Mise à jour polylines + marqueurs quand circuits/activeIndex changent ──
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    ;(async () => {
      const L = await import('leaflet')

      // Nettoyer les anciennes polylines
      polylinesRef.current.forEach((p) => p.remove())
      polylinesRef.current = []

      // Nettoyer les marqueurs
      depMarkerRef.current?.remove(); depMarkerRef.current = null
      arrMarkerRef.current?.remove(); arrMarkerRef.current = null

      if (!circuits.length) return

      // Dessiner les circuits inactifs d'abord (en dessous)
      for (let i = 0; i < circuits.length; i++) {
        if (i === activeIndex) continue
        const c = circuits[i]
        const style = { ...POLYLINE_STYLES.alt }
        const pl = L.polyline(c.latLngs, {
          color:     style.color,
          weight:    style.weight,
          opacity:   style.opacity,
          dashArray: style.dashArray,
        }).addTo(map)

        // Click sur circuit inactif → sélectionner
        const idx = i
        pl.on('click', () => onCircuitClick(idx))
        pl.bindTooltip(
          `<div style="font-size:11px;font-weight:600;color:#7a90b8">${c.summary}</div>`,
          { sticky: true, className: 'ms-tooltip' },
        )
        polylinesRef.current.push(pl)
      }

      // Dessiner le circuit actif par-dessus
      if (circuits[activeIndex]) {
        const active = circuits[activeIndex]
        const style  = POLYLINE_STYLES.done
        const pl = L.polyline(active.latLngs, {
          color:   style.color,
          weight:  style.weight,
          opacity: style.opacity,
        }).addTo(map)
        pl.bindTooltip(
          `<div style="font-size:11px;font-weight:700;color:${MAP_COLORS.brand}">${active.summary}</div>`,
          { sticky: true, className: 'ms-tooltip' },
        )
        polylinesRef.current.push(pl)

        // Marqueur départ
        const depIcon = await createDepartIcon()
        depMarkerRef.current = L.marker(
          [active.latLngs[0][0], active.latLngs[0][1]],
          { icon: depIcon, zIndexOffset: 1000 },
        )
          .addTo(map)
          .bindPopup(`<div style="padding:8px 12px;font-family:'DM Sans',sans-serif"><b style="color:#0aad6a">Départ</b><br/><span style="font-size:11px">${active.departureLabel}</span></div>`, { className: 'ms-popup' })

        // Marqueur arrivée
        const arrIcon = await createArriveeIcon()
        const last = active.latLngs[active.latLngs.length - 1]
        arrMarkerRef.current = L.marker(
          [last[0], last[1]],
          { icon: arrIcon, zIndexOffset: 1000 },
        )
          .addTo(map)
          .bindPopup(`<div style="padding:8px 12px;font-family:'DM Sans',sans-serif"><b style="color:#e03050">Arrivée</b><br/><span style="font-size:11px">${active.arrivalLabel}</span></div>`, { className: 'ms-popup' })

        // Ajuster le viewport sur le circuit actif
        map.fitBounds(pl.getBounds(), { padding: [40, 40], maxZoom: 15 })
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [circuits, activeIndex])

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  )
}
