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
import { FaMapMarkerAlt } from 'react-icons/fa'
import type { TrajetMapProps } from '../types/map.types'
import { useTrajetMap } from '../hooks/useTrajetMap'
import { fixtureMapPrincipale } from '../fixtures/map.fixtures'
import { Language, useAppState } from '@/core/state/app_state'
import { MAP_COLORS, createCursorIcon, destroyOffScreenButtons } from '@/features/map-service'
import type { CursorMode } from '@/features/map-service'
import { initTrajetMap } from './trajet-map-init'
import { TrajetMapLegend } from './TrajetMapLegend'
import { TrajetMapControls } from './TrajetMapControls'

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

    initTrajetMap(mapRef.current, fixture, isFR).then((result) => {
      leafletRef.current      = result.leaflet
      mapInstanceRef.current  = result.map
      donePolyRef.current     = result.donePoly
      remainPolyRef.current   = result.remainPoly
      cursorRef.current       = result.cursor
      departRef.current       = result.departMarker
      arriveeRef.current      = result.arriveeMarker
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
  const mPerSec      = (state.fixture.vitesseMoyenneKmh * 1000) / 3600
  const secRestants  = Math.max(0, (state.fixture.distanceTotaleM - state.distanceParcourue) / mPerSec)
  const distRestKm   = ((state.fixture.distanceTotaleM - state.distanceParcourue) / 1000).toFixed(1)
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

      {/* ── Contrôles (barre inférieure) ── */}
      <TrajetMapControls
        autoCenter={autoCenter}
        onToggleAutoCenter={() => {
          if (!autoCenter) {
            const pos = state.positionActuelle
            mapInstanceRef.current?.panTo([pos.lat, pos.lng], { animate: true, duration: 0.8 })
          }
          setAutoCenter((v) => !v)
        }}
        cursorMode={cursorMode}
        onToggleCursorMode={() => setCursorMode((m) => m === 'arrow' ? 'car' : 'arrow')}
        recalculerItineraire={recalculerItineraire}
        isRecalculating={isRecalculating}
        onGPS={handleGPS}
        role={role}
        isFR={isFR}
        isDarkMode={isDarkMode}
      />

      {/* ── Légende ── */}
      <TrajetMapLegend
        show={showLegend}
        onToggle={() => setShowLegend((v) => !v)}
        isDarkMode={isDarkMode}
        isFR={isFR}
        labelDepart={state.fixture.labelDepart}
        labelArrivee={state.fixture.labelArrivee}
      />

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
