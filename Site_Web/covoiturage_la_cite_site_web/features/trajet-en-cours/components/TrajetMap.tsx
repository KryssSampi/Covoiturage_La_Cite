'use client'
// ─────────────────────────────────────────────────────────────────────────────
// features/trajet-en-cours/components/TrajetMap.tsx  [v2 — MapService]
//
// Carte Leaflet + CARTO Voyager (MapService)
//  • Tuiles CARTO Voyager (routes colorées)
//  • Polyline bicolore (bleu foncé complété / gris restant)
//  • Curseur flèche Google Maps SVG ou voiture — switchable
//  • Marqueurs MapService : départ dot, drapeau arrivée
//  • Couche campus La Cité (polygone + zones internes)
//  • Couche Overpass : arrêts bus + stations-service
//  • Boutons off-screen pour campus / domicile
//  • Bouton GPS conducteur → Google Maps / app native
//  • Recalcul OSRM si déviation
//  • CSS MapService injecté automatiquement
//  • Simulation temps réel 50 km/h — enchaînement automatique des trajets
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  FaCrosshairs, FaCar, FaArrowUp, FaSyncAlt,
  FaFlagCheckered, FaBus, FaGasPump, FaMapMarkerAlt, FaList,
  FaGraduationCap,
} from 'react-icons/fa'
import type { TrajetMapProps } from '../types/map.types'
import { useTrajetMap } from '../hooks/useTrajetMap'
import { fixtureMapPrincipale } from '../fixtures/map.fixtures'
import { FIXTURE_LIEUX_FAVORIS } from '@/shared/fixtures/favoris.fixtures'
import { Language, useAppState } from '@/core/state/app_state'

// MapService — import depuis le module centralisé
import {
  TILE_CONFIGS,
  POLYLINE_STYLES,
  MAP_COLORS,
  injectMapServiceCSS,
  createCursorIcon,
  createDepartIcon,
  createArriveeIcon,
  createFavoriIcon,
  conducteurPopup,
  addCampusLayer,
  addOverpassLayer,
  initOffScreenButtons,
  destroyOffScreenButtons,
} from '@/features/map-service'

import type { CursorMode } from '@/features/map-service'

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════
export function TrajetMap({
  fixture = fixtureMapPrincipale,
  height  = '360px',
  role    = 'passenger',
  trajetHook,
}: TrajetMapProps) {
  // Si le parent fournit l'état via trajetHook, on l'utilise ; sinon on instancie le hook interne
  const internalHook = useTrajetMap(trajetHook ? undefined! : fixture)
  const { state, recalculerItineraire, isRecalculating } = trajetHook ?? internalHook

  // Langue
  const appState = useAppState()
  const isFR = appState.lang === Language.FR

  const mapRef        = useRef<HTMLDivElement>(null)
  const leafletRef    = useRef<typeof import('leaflet') | null>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)

  // Refs Leaflet layers
  const donePolyRef   = useRef<import('leaflet').Polyline | null>(null)
  const remainPolyRef = useRef<import('leaflet').Polyline | null>(null)
  const cursorRef     = useRef<import('leaflet').Marker | null>(null)
  const departRef     = useRef<import('leaflet').Marker | null>(null)
  const arriveeRef    = useRef<import('leaflet').Marker | null>(null)

  const [mapReady, setMapReady]     = useState(false)
  const [cursorMode, setCursorMode] = useState<CursorMode>('arrow')
  const [autoCenter, setAutoCenter] = useState(false)
  const [showLegend, setShowLegend] = useState(true)
  const [showGpsToast, setShowGpsToast] = useState(false)

  // ── Mode sombre automatique (19h → 6h heure locale) ───────────────────────
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const h = new Date().getHours()
    return h >= 19 || h < 6
  })

  // Vérifie toutes les minutes si l'heure a changé de plage
  useEffect(() => {
    const check = () => {
      const h = new Date().getHours()
      setIsDarkMode(h >= 19 || h < 6)
    }
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [])

  // ── Init Leaflet + MapService ──────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Injection CSS une seule fois
    injectMapServiceCSS()

    import('leaflet').then(async (L) => {
      // Fix icônes Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({ iconRetinaUrl: '', iconUrl: '', shadowUrl: '' })
      leafletRef.current = L

      // ── Carte ──────────────────────────────────────────────────────────
      const map = L.map(mapRef.current!, {
        zoomControl:      false,
        attributionControl: true,
        preferCanvas:     true,
      }).setView([fixture.depart.lat, fixture.depart.lng], 13)

      // ── Tuiles CARTO Voyager (MapService) ──────────────────────────────
      const tileConf = TILE_CONFIGS['carto-voyager']
      L.tileLayer(tileConf.url, {
        attribution: tileConf.attribution,
        subdomains:  tileConf.subdomains ?? 'abc',
        maxZoom:     tileConf.maxZoom,
      }).addTo(map)

      // ── Zoom control repositionné ──────────────────────────────────────
      L.control.zoom({ position: 'topright' }).addTo(map)

      // ── Polylines ──────────────────────────────────────────────────────
      const remainPoly = L.polyline(
        fixture.polyline.map((p) => [p.lat, p.lng] as [number, number]),
        POLYLINE_STYLES.remain,
      ).addTo(map)
      remainPolyRef.current = remainPoly

      const donePoly = L.polyline(
        [[fixture.depart.lat, fixture.depart.lng]],
        POLYLINE_STYLES.done,
      ).addTo(map)
      donePolyRef.current = donePoly

      // ── Marqueur départ ────────────────────────────────────────────────
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
      departRef.current = departMarker

      // ── Marqueur arrivée ───────────────────────────────────────────────
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
      arriveeRef.current = arriveeMarker

      // ── Curseur flèche ─────────────────────────────────────────────────
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
      cursorRef.current = cursor

      // ── Couche campus La Cité ──────────────────────────────────────────
      await addCampusLayer(map, L, { showPerimeter: true, showZones: true })

      // ── Couche Overpass (arrêts bus + stations-service) ────────────────
      await addOverpassLayer(map, L, { showBusStops: true, showGasStations: true })

      // ── Marqueurs favoris — toujours visibles, quel que soit le zoom ──
      const favoriColors: Record<string, string> = {
        campus: MAP_COLORS.brand,
        domicile: MAP_COLORS.depart,
        travail: MAP_COLORS.passager,
        ville: MAP_COLORS.rencontre,
        autre: MAP_COLORS.routeAlt,
        ecole: MAP_COLORS.brand,
      }
      // Descriptions spéciales pour les favoris connus
      const favoriDesc: Record<string, string> = {
        campus: isFR ? 'Collège La Cité — Campus principal' : 'La Cité College — Main campus',
        domicile: isFR ? 'Mon domicile' : 'My home',
        travail: isFR ? 'Lieu de travail' : 'Workplace',
      }
      for (const fav of FIXTURE_LIEUX_FAVORIS) {
        const color = favoriColors[fav.iconTag] ?? MAP_COLORS.brand
        const icon = await createFavoriIcon(fav.pseudonyme, color, fav.iconTag)
        const desc = favoriDesc[fav.iconTag] ?? ''
        L.marker(
          [fav.coordonnees.lat, fav.coordonnees.lng],
          { icon, zIndexOffset: 200 },
        )
          .addTo(map)
          .bindTooltip(
            `<div style="font-family:'DM Sans',sans-serif;text-align:center">
               <div style="font-weight:700;font-size:11px;color:${color}">${fav.pseudonyme}</div>
               ${desc ? `<div style="font-size:9px;color:#7a90b8;margin-top:1px">${desc}</div>` : ''}
             </div>`,
            { direction: 'top', offset: [0, -38], className: 'ms-tooltip' },
          )
          .bindPopup(
            `<div style="padding:9px 12px;font-family:'DM Sans',sans-serif">
               <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:12px;color:${color}">${fav.pseudonyme}</div>
               <div style="font-size:10px;color:#7a90b8;margin-top:2px">${fav.adresse}</div>
             </div>`,
            { className: 'ms-popup' },
          )
      }

      // ── Boutons off-screen (campus + domicile uniquement) ─────────────
      initOffScreenButtons(
        mapRef.current!,
        map,
        [
          {
            id:          'campus',
            label:       isFR ? 'Campus La Cité' : 'La Cité Campus',
            icone:       '🎓',  // Rendu en HTML dans le bouton off-screen DOM
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

      // ── Fit bounds ─────────────────────────────────────────────────────
      map.fitBounds(
        L.latLngBounds(
          fixture.polyline.map((p) => [p.lat, p.lng] as [number, number]),
        ),
        { padding: [44, 44] },
      )

      mapInstanceRef.current = map
      setMapReady(true)
    })

    return () => {
      destroyOffScreenButtons()
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Bascule classe ms-dark sur le conteneur carte selon l'heure ────────────
  useEffect(() => {
    const el = mapRef.current
    if (!el) return
    if (isDarkMode) {
      el.classList.add('ms-dark')
    } else {
      el.classList.remove('ms-dark')
    }
  }, [isDarkMode, mapReady])

  // ── Mise à jour temps réel ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mapReady || !leafletRef.current) return
    const { positionActuelle, headingActuel, distanceParcourue, fixture: f } = state

    // 1. Curseur
    createCursorIcon(headingActuel, cursorMode).then((icon) => {
      cursorRef.current?.setLatLng([positionActuelle.lat, positionActuelle.lng])
      cursorRef.current?.setIcon(icon)
    })

    // 2. Split polyline selon distance parcourue
    const pts = f.polyline
    let cum = 0
    let splitIdx = 0
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = (pts[i + 1].lng - pts[i].lng) * 111000 * Math.cos(pts[i].lat * Math.PI / 180)
      const dy = (pts[i + 1].lat - pts[i].lat) * 111000
      cum += Math.sqrt(dx * dx + dy * dy)
      if (cum >= distanceParcourue) { splitIdx = i + 1; break }
    }
    splitIdx = Math.max(1, Math.min(splitIdx, pts.length - 1))

    const donePts   = [...pts.slice(0, splitIdx + 1), positionActuelle]
    const remainPts = [positionActuelle, ...pts.slice(splitIdx)]

    donePolyRef.current?.setLatLngs(donePts.map((p) => [p.lat, p.lng] as [number, number]))
    remainPolyRef.current?.setLatLngs(remainPts.map((p) => [p.lat, p.lng] as [number, number]))

    // 3. Auto-center
    if (autoCenter && mapInstanceRef.current) {
      mapInstanceRef.current.panTo([positionActuelle.lat, positionActuelle.lng], {
        animate: true, duration: 0.8,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.positionActuelle, state.headingActuel, state.distanceParcourue, mapReady, cursorMode, autoCenter])

  // ── Mise à jour marqueurs et fitBounds quand la fixture change ───────────
  useEffect(() => {
    if (!mapReady || !leafletRef.current) return
    const L = leafletRef.current
    const { fixture: f } = state

    departRef.current?.setLatLng([f.depart.lat, f.depart.lng])
    arriveeRef.current?.setLatLng([f.arrivee.lat, f.arrivee.lng])

    mapInstanceRef.current?.fitBounds(
      L.latLngBounds(f.polyline.map((p) => [p.lat, p.lng] as [number, number])),
      { padding: [44, 44], animate: true, duration: 1 },
    )
  // Réagit aussi à distanceTotaleM pour détecter le remplacement OSRM (même id, nouvelle polyline)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.fixture.id, state.fixture.distanceTotaleM, mapReady])

  // ── Bouton GPS ─────────────────────────────────────────────────────────────
  const handleGPS = useCallback(() => {
    const { arrivee } = state.fixture
    const { positionActuelle } = state
    const origin = `${positionActuelle.lat},${positionActuelle.lng}`
    const dest   = `${arrivee.lat},${arrivee.lng}`

    const ua = navigator.userAgent
    let url: string
    if (/iPhone|iPad/.test(ua)) {
      url = `maps://?saddr=${origin}&daddr=${dest}&dirflg=d`
    } else if (/Android/.test(ua)) {
      url = `geo:0,0?q=${dest}`
    } else {
      url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
    }
    window.open(url, '_blank', 'noopener,noreferrer')
    setShowGpsToast(true)
    setTimeout(() => setShowGpsToast(false), 3500)
  }, [state])

  // ── Métriques affichées ────────────────────────────────────────────────────
  const pct          = state.pourcentageComplete
  const mPerSec      = (state.fixture.vitesseMoyenneKmh * 1000) / 3600
  const secRestants  = Math.max(0, (state.fixture.distanceTotaleM - state.distanceParcourue) / mPerSec)
  const distRestKm   = ((state.fixture.distanceTotaleM - state.distanceParcourue) / 1000).toFixed(1)
  const distDoneKm   = (state.distanceParcourue / 1000).toFixed(1)
  const minRest      = Math.floor(secRestants / 60)
  const secRest      = Math.floor(secRestants % 60)
  const etaStr       = minRest > 0 ? `${minRest} min ${secRest > 0 ? secRest + ' s' : ''}` : `${Math.floor(secRestants)} s`

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 20px rgba(8,49,110,0.13)', background: isDarkMode ? '#0e1b2e' : '#eef2f8' }}>

      {/* ── Carte Leaflet ── */}
      <div ref={mapRef} style={{ width: '100%', height: '60vh' }} />

      {/* ── Badge route (haut gauche) ── */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 500,
        background: isDarkMode ? 'rgba(14,27,46,0.92)' : 'rgba(255,255,255,0.97)',
        border: `1px solid ${isDarkMode ? 'rgba(200,214,234,0.12)' : 'rgba(8,49,110,0.1)'}`,
        borderRadius: 10, padding: '7px 13px',
        boxShadow: '0 2px 10px rgba(8,49,110,0.1)',
        display: 'flex', alignItems: 'center', gap: 8,
        pointerEvents: 'none', backdropFilter: 'blur(4px)',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: MAP_COLORS.depart, flexShrink: 0 }} />
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, color: isDarkMode ? '#90b8e8' : MAP_COLORS.brand }}>
          {state.fixture.labelDepart}
        </span>
        <span style={{ color: isDarkMode ? '#4a6080' : '#b0bfd8', fontSize: 13 }}>→</span>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, color: isDarkMode ? '#ff7090' : MAP_COLORS.arrivee }}>
          {state.fixture.labelArrivee}
        </span>
      </div>

      {/* ── Badge ETA (haut droite) ── */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 500,
        background: MAP_COLORS.brand, color: '#fff',
        fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
        padding: '6px 14px', borderRadius: 20,
        boxShadow: '0 2px 10px rgba(8,49,110,0.3)',
        display: 'flex', alignItems: 'center', gap: 6,
        pointerEvents: 'none',
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {state.estTermine ? (isFR ? 'Arrivé — chargement…' : 'Arrived — loading…') : `${distRestKm} km · ${etaStr}`}
      </div>

      {/* ── Pastille prochain trajet prêt ── */}
      {state.prochainFixture && !state.estTermine && (
        <div style={{
          position: 'absolute', top: 52, right: 12, zIndex: 500,
          background: 'rgba(10,173,106,0.12)', border: '1px solid rgba(10,173,106,0.3)',
          borderRadius: 8, padding: '4px 10px',
          fontSize: 10, fontWeight: 600, color: '#0a7a4c',
          display: 'flex', alignItems: 'center', gap: 5,
          pointerEvents: 'none',
        }}>
          <span style={{ width: 5, height: 5, borderRadius: '50%', background: MAP_COLORS.depart, display: 'inline-block' }} />
          {isFR ? 'Prochain trajet prêt' : 'Next trip ready'}
        </div>
      )}

      {/* ── contrôles  ── */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 500,
        background: isDarkMode
          ? 'linear-gradient(to top, rgba(14,27,46,0.98) 0%, rgba(14,27,46,0.94) 65%, transparent 100%)'
          : 'linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 65%, transparent 100%)',
        padding: '10px 16px 14px',
        backdropFilter: 'blur(2px)',
      }}>

        {/* Stats + boutons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>

      

          {/* Contrôles */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>

            {/* Bouton recentrer — seul moyen de recentrer la carte */}
            <button
              title={autoCenter ? (isFR ? 'Désactiver suivi auto' : 'Disable auto follow') : (isFR ? 'Recentrer sur le curseur' : 'Recenter on cursor')}
              onClick={() => {
                if (!autoCenter) {
                  // Recentre immédiatement puis active le suivi
                  const pos = state.positionActuelle
                  mapInstanceRef.current?.panTo([pos.lat, pos.lng], { animate: true, duration: 0.8 })
                }
                setAutoCenter((v) => !v)
              }}
              style={{
                width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
                border: `1.5px solid ${autoCenter ? MAP_COLORS.brand : 'rgba(8,49,110,0.18)'}`,
                background: autoCenter ? 'rgba(8,49,110,0.08)' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
              }}
            ><FaCrosshairs size={14} color={autoCenter ? MAP_COLORS.brand : '#7a90b8'} /></button>

            {/* Cursor toggle */}
            <button
              onClick={() => setCursorMode((m) => m === 'arrow' ? 'car' : 'arrow')}
              style={{
                height: 32, padding: '0 10px', borderRadius: 8, cursor: 'pointer',
                border: '1.5px solid rgba(8,49,110,0.18)', background: '#fff',
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 600, color: MAP_COLORS.brand,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {cursorMode === 'arrow'
                ? <><FaCar size={12} /> {isFR ? 'Voiture' : 'Car'}</>
                : <><FaArrowUp size={12} /> {isFR ? 'Flèche' : 'Arrow'}</>}
            </button>

            {/* Recalculer OSRM */}
            <button
              onClick={recalculerItineraire}
              disabled={isRecalculating}
              title={isFR ? "Recalculer l'itinéraire depuis la position actuelle" : "Recalculate route from current position"}
              style={{
                height: 32, padding: '0 10px', borderRadius: 8,
                border: '1.5px solid rgba(8,49,110,0.18)',
                background: isRecalculating ? 'rgba(8,49,110,0.05)' : '#fff',
                cursor: isRecalculating ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 600,
                color: isRecalculating ? '#7a90b8' : MAP_COLORS.brand,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              {isRecalculating ? <><FaSyncAlt size={10} className="animate-spin" /> …</> : <><FaSyncAlt size={10} /> {isFR ? 'Recalculer' : 'Recalculate'}</>}
            </button>

            {/* GPS conducteur uniquement */}
            {role === 'driver' && (
              <button
                onClick={handleGPS}
                style={{
                  height: 32, padding: '0 14px', borderRadius: 8,
                  background: `linear-gradient(135deg, ${MAP_COLORS.brand}, ${MAP_COLORS.brandLight})`,
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, color: '#fff',
                  boxShadow: '0 2px 8px rgba(8,49,110,0.25)',
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                </svg>
                {isFR ? 'Continuer sur GPS' : 'Continue on GPS'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Légende ── */}
      {showLegend && (
        <div style={{
          position: 'absolute', bottom: 88, left: 14, zIndex: 500,
          background: isDarkMode ? 'rgba(14,27,46,0.97)' : 'rgba(255,255,255,0.97)',
          border: `1px solid ${isDarkMode ? 'rgba(200,214,234,0.12)' : 'rgba(8,49,110,0.1)'}`,
          borderRadius: 10, padding: '10px 13px',
          boxShadow: '0 2px 12px rgba(8,49,110,0.1)',
          backdropFilter: 'blur(4px)',
          pointerEvents: 'none',
        }}>
          <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 9, color: isDarkMode ? '#90b8e8' : MAP_COLORS.brand, marginBottom: 7, textTransform: 'uppercase', letterSpacing: '.6px' }}>
            {isFR ? 'Légende' : 'Legend'}
          </div>
          {[
            { el: <div style={{ width: 10, height: 10, borderRadius: '50%', background: MAP_COLORS.depart, border: '2px solid white', boxShadow: `0 0 0 1.5px ${MAP_COLORS.depart}`, flexShrink: 0 }} />,       lbl: state.fixture.labelDepart },
            { el: <div style={{ width: 20, height: 3, background: MAP_COLORS.routeDone, borderRadius: 2, flexShrink: 0 }} />,                                                                                      lbl: isFR ? 'Tronçon parcouru' : 'Completed section' },
            { el: <div style={{ width: 20, height: 3, background: MAP_COLORS.routeRemain, borderRadius: 2, flexShrink: 0, opacity: .75 }} />,                                                                      lbl: isFR ? 'Tronçon restant' : 'Remaining section' },
            { el: <FaFlagCheckered size={10} color={MAP_COLORS.arrivee} style={{ flexShrink: 0 }} />,                                                                                          lbl: state.fixture.labelArrivee },
            { el: <FaBus size={10} color={MAP_COLORS.busStop} style={{ flexShrink: 0 }} />,                                                                                                  lbl: isFR ? 'Arrêts OC Transpo' : 'OC Transpo stops' },
            { el: <FaGasPump size={10} color={MAP_COLORS.gasStation} style={{ flexShrink: 0 }} />,                                                                                           lbl: isFR ? 'Stations-service' : 'Gas stations' },
            { el: <FaMapMarkerAlt size={10} color={MAP_COLORS.campusZone} style={{ flexShrink: 0 }} />,                                                                                      lbl: isFR ? 'Zones campus' : 'Campus zones' },
            { el: <FaGraduationCap size={10} color={MAP_COLORS.brand} style={{ flexShrink: 0 }} />,                                                                                          lbl: isFR ? 'Favoris' : 'Favourites' },
          ].map((r, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              {r.el}
              <span style={{ fontSize: 10, color: isDarkMode ? '#b0c4e0' : '#0d1f3c', whiteSpace: 'nowrap' }}>{r.lbl}</span>
            </div>
          ))}
          <button
            onClick={() => setShowLegend(false)}
            style={{
              marginTop: 5, fontSize: 9, color: '#7a90b8', background: 'none', border: 'none',
              cursor: 'pointer', padding: 0, textDecoration: 'underline', pointerEvents: 'all',
            }}
          >
            {isFR ? 'Masquer' : 'Hide'}
          </button>
        </div>
      )}
      {!showLegend && (
        <button
          onClick={() => setShowLegend(true)}
          style={{
            position: 'absolute', bottom: 88, left: 14, zIndex: 500,
            background: isDarkMode ? 'rgba(14,27,46,0.97)' : 'rgba(255,255,255,0.97)',
            border: `1px solid ${isDarkMode ? 'rgba(200,214,234,0.15)' : 'rgba(8,49,110,0.15)'}`,
            borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 600,
            color: isDarkMode ? '#90b8e8' : MAP_COLORS.brand, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        ><FaList size={9} /> {isFR ? 'Légende' : 'Legend'}</button>
      )}

      {/* ── Toast GPS ── */}
      {showGpsToast && (
        <div style={{
          position: 'absolute', bottom: 100, right: 12, zIndex: 600,
          background: MAP_COLORS.brand, color: '#fff', borderRadius: 10,
          padding: '10px 16px', fontSize: 12, fontWeight: 600,
          boxShadow: '0 4px 16px rgba(8,49,110,0.3)',
          display: 'flex', alignItems: 'center', gap: 8,
          animation: 'ms-fadein .3s ease',
        }}>
          <FaMapMarkerAlt size={12} /> {isFR ? 'Ouverture de Google Maps…' : 'Opening Google Maps…'}
        </div>
      )}

      {/* ── Loader initial ── */}
      {!mapReady && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 400, background: isDarkMode ? '#0e1b2e' : '#eef2f8',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            border: '3px solid rgba(8,49,110,0.1)',
            borderTop: `3px solid ${MAP_COLORS.brand}`,
            animation: 'ms-spin .8s linear infinite',
          }} />
          <div style={{ fontSize: 12, color: '#7a90b8', fontFamily: 'DM Sans, sans-serif' }}>
            {isFR ? 'Chargement de la carte…' : 'Loading map…'}
          </div>
        </div>
      )}

      <style>{`
        @keyframes ms-spin   { to { transform: rotate(360deg) } }
        @keyframes ms-fadein { from{opacity:0;transform:translateY(4px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}
