// ─────────────────────────────────────────────────────────────────────────────
// features/trajet-en-cours/components/trajet-map-init.ts
// Initialisation Leaflet + MapService pour TrajetMap
// Extrait de TrajetMap.tsx pour réduire la taille du composant principal
// ─────────────────────────────────────────────────────────────────────────────
import type { TrajetMapFixture, LatLng } from '../types/map.types'
import { FIXTURE_LIEUX_FAVORIS } from '@/shared/fixtures/favoris.fixtures'
import {
  TILE_CONFIGS,
  POLYLINE_STYLES,
  MAP_COLORS,
  injectMapServiceCSS,
  createCursorIcon,
  createDepartIcon,
  createArriveeIcon,
  addFavoritesLayer,
  conducteurPopup,
  addCampusLayer,
  addOverpassLayer,
  initOffScreenButtons,
} from '@/features/map-service'

// ── Types pour les résultats de l'initialisation ─────────────────────────────
export interface TrajetMapInitResult {
  leaflet:       typeof import('leaflet')
  map:           import('leaflet').Map
  donePoly:      import('leaflet').Polyline
  remainPoly:    import('leaflet').Polyline
  cursor:        import('leaflet').Marker
  departMarker:  import('leaflet').Marker
  arriveeMarker: import('leaflet').Marker
}

// ── Fonction d'initialisation de la carte Leaflet ────────────────────────────
export async function initTrajetMap(
  container: HTMLDivElement,
  fixture:   TrajetMapFixture,
  isFR:      boolean,
): Promise<TrajetMapInitResult> {
  // Injection CSS MapService (une seule fois)
  injectMapServiceCSS()

  const L = await import('leaflet')

  // Fix icônes Next.js
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' })

  // ── Carte ──────────────────────────────────────────────────────────────
  const map = L.map(container, {
    zoomControl:        false,
    attributionControl: true,
    preferCanvas:       true,
    scrollWheelZoom:    true,
  }).setView([fixture.depart.lat, fixture.depart.lng], 13)

  // ── Tuiles CARTO Voyager ───────────────────────────────────────────────
  const tileConf = TILE_CONFIGS['carto-voyager']
  L.tileLayer(tileConf.url, {
    attribution: tileConf.attribution,
    subdomains:  tileConf.subdomains ?? 'abc',
    maxZoom:     tileConf.maxZoom,
  }).addTo(map)

  // ── Zoom control repositionné ──────────────────────────────────────────
  L.control.zoom({ position: 'topright' }).addTo(map)

  // ── Polylines bicolores ────────────────────────────────────────────────
  const remainPoly = L.polyline(
    fixture.polyline.map((p: LatLng) => [p.lat, p.lng] as [number, number]),
    POLYLINE_STYLES.remain,
  ).addTo(map)

  const donePoly = L.polyline(
    [[fixture.depart.lat, fixture.depart.lng]],
    POLYLINE_STYLES.done,
  ).addTo(map)

  // ── Marqueur départ ────────────────────────────────────────────────────
  const dIcon = await createDepartIcon()
  const departMarker = L.marker(
    [fixture.depart.lat, fixture.depart.lng],
    { icon: dIcon, zIndexOffset: 100 },
  )
    .addTo(map)
    .bindTooltip(
      `<div style="font-family:'DM Sans',sans-serif;text-align:center">
         <div style="font-weight:700;font-size:11px;color:#08316e">${fixture.labelDepart}</div>
         <div style="font-size:9px;color:#7a90b8;margin-top:1px">${isFR ? 'Point de départ' : 'Departure point'}</div>
       </div>`,
      { direction: 'top', offset: [0, -11], className: 'ms-tooltip' },
    )
    .bindPopup(
      `<div style="padding:9px 12px;font-family:'DM Sans',sans-serif">
         <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:12px;color:#08316e">${fixture.labelDepart}</div>
         <div style="font-size:10px;color:#7a90b8;margin-top:2px">${isFR ? 'Point de départ' : 'Departure point'}</div>
       </div>`,
      { className: 'ms-popup' },
    )

  // ── Marqueur arrivée ───────────────────────────────────────────────────
  const aIcon = await createArriveeIcon()
  const arriveeMarker = L.marker(
    [fixture.arrivee.lat, fixture.arrivee.lng],
    { icon: aIcon, zIndexOffset: 100 },
  )
    .addTo(map)
    .bindTooltip(
      `<div style="font-family:'DM Sans',sans-serif;text-align:center">
         <div style="font-weight:700;font-size:11px;color:#e03050">${fixture.labelArrivee}</div>
         <div style="font-size:9px;color:#7a90b8;margin-top:1px">Destination</div>
       </div>`,
      { direction: 'top', offset: [0, -11], className: 'ms-tooltip' },
    )
    .bindPopup(
      `<div style="padding:9px 12px;font-family:'DM Sans',sans-serif">
         <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:12px;color:#e03050">${fixture.labelArrivee}</div>
         <div style="font-size:10px;color:#7a90b8;margin-top:2px">Destination</div>
       </div>`,
      { className: 'ms-popup' },
    )

  // ── Curseur flèche ─────────────────────────────────────────────────────
  const cIcon = await createCursorIcon(0, 'arrow')
  const cursor = L.marker(
    [fixture.depart.lat, fixture.depart.lng],
    { icon: cIcon, zIndexOffset: 1000 },
  )
    .addTo(map)
    .bindTooltip(
      `<div style="font-family:'DM Sans',sans-serif;text-align:center">
         <div style="font-weight:700;font-size:11px;color:#08316e">Julie T.</div>
         <div style="font-size:9px;color:#7a90b8;margin-top:1px">${isFR ? 'Conductrice' : 'Driver'}</div>
       </div>`,
      { direction: 'top', offset: [0, -22], className: 'ms-tooltip' },
    )
    .bindPopup(
      conducteurPopup({
        prenom:    'Julie',
        nom:       'Tremblay',
        initiales: 'JT',
        note:      4.5,
        nbTrajets: 60,
        vehicule:  'Honda Civic 2020 Noire',
      }),
      { className: 'ms-popup', maxWidth: 220 },
    )

  // ── Couche campus La Cité ──────────────────────────────────────────────
  await addCampusLayer(map, L, { showPerimeter: true, showZones: true, showBusStopZone: false })

  // ── Couche Overpass (services publics + stations-service) ────────────────────
  await addOverpassLayer(map, L, { showBusStops: false, showGasStations: true, showPublicServices: true })

  // -- Marqueurs favoris --
  await addFavoritesLayer(map, L, FIXTURE_LIEUX_FAVORIS, { isFR })



  // ── Boutons off-screen (campus + domicile) ─────────────────────────────
  initOffScreenButtons(
    container,
    map,
    [
      {
        id:          'campus',
        label:       isFR ? 'Campus La Cité' : 'La Cité Campus',
        icone:       '🎓',
        coordonnees: FIXTURE_LIEUX_FAVORIS.find(f => f.id === 'campus-la-cite')!.coordonnees,
        color:       MAP_COLORS.brand,
      },
      {
        id:          'domicile',
        label:       isFR ? 'Mon domicile' : 'My home',
        icone:       '⌂',
        coordonnees: FIXTURE_LIEUX_FAVORIS.find(f => f.id === 'domicile')?.coordonnees ?? { lat: 45.4380, lng: -75.7200 },
        color:       MAP_COLORS.depart,
      },
    ],
    (target) => {
      console.log('[MapService] Off-screen click →', target.label)
    },
  )

  // ── Fit bounds ─────────────────────────────────────────────────────────
  map.fitBounds(
    L.latLngBounds(
      fixture.polyline.map((p: LatLng) => [p.lat, p.lng] as [number, number]),
    ),
    { padding: [44, 44] },
  )

  return { leaflet: L, map, donePoly, remainPoly, cursor, departMarker, arriveeMarker }
}






