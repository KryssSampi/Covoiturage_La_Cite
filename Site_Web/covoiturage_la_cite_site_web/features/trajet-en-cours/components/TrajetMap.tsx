'use client'
// ─────────────────────────────────────────────────────────────────────────────
// features/trajet-en-cours/components/TrajetMap.tsx
//
// Carte Leaflet temps réel pour la page "trajet en cours".
//  • Positions réelles : driverPos / myPos injectés par TrajetEnCoursPage (SSE)
//  • Curseur conducteur  : positionné sur driverPos quand disponible
//  • Marqueur "Vous"     : pastille bleue avec tooltip permanent pour myPos
//  • Bouton GPS adapté au rôle (conducteur → arrivée, passager → départ)
//  • Tuiles CARTO Voyager, mode sombre 19h–6h
//  • scrollWheelZoom désactivé (ne bloque plus le scroll de la page)
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

// ── Marqueur "Vous" (pastille bleue) ─────────────────────────────────────────
function makeYouIcon(L: typeof import('leaflet')) {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:#1a5cb0;border:3px solid #fff;box-shadow:0 2px 8px rgba(8,49,110,0.5);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

// ── Props étendues ────────────────────────────────────────────────────────────
export interface TrajetMapExtendedProps extends TrajetMapProps {
  /** Position temps réel du conducteur — null si pas encore disponible */
  driverPos?: { lat: number; lng: number } | null
  /** Position GPS de l'utilisateur connecté — null si pas disponible */
  myPos?: { lat: number; lng: number } | null
  /** Coordonnées du lieu de départ (pour GPS passager) */
  departureCoords?: { lat: number; lng: number }
  /** Coordonnées du lieu d'arrivée (pour GPS conducteur) */
  arrivalCoords?: { lat: number; lng: number }
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════
export function TrajetMap({
  fixture = fixtureMapPrincipale,
  height  = '360px',
  role    = 'passenger',
  trajetHook,
  driverPos,
  myPos,
  departureCoords,
  arrivalCoords,
}: TrajetMapExtendedProps) {
  const internalHook = useTrajetMap(trajetHook ? undefined! : fixture)
  const { state, recalculerItineraire, isRecalculating } = trajetHook ?? internalHook

  const appState = useAppState()
  const isFR = appState.lang === Language.FR

  const mapRef         = useRef<HTMLDivElement>(null)
  const leafletRef     = useRef<typeof import('leaflet') | null>(null)
  const mapInstanceRef = useRef<import('leaflet').Map | null>(null)

  const donePolyRef     = useRef<import('leaflet').Polyline | null>(null)
  const remainPolyRef   = useRef<import('leaflet').Polyline | null>(null)
  const cursorRef       = useRef<import('leaflet').Marker | null>(null)
  const departRef       = useRef<import('leaflet').Marker | null>(null)
  const arriveeRef      = useRef<import('leaflet').Marker | null>(null)
  const youMarkerRef    = useRef<import('leaflet').Marker | null>(null)
  const cursorOnMapRef  = useRef(false)

  const [mapReady, setMapReady]     = useState(false)
  const [cursorMode, setCursorMode] = useState<CursorMode>('arrow')
  const [autoCenter, setAutoCenter] = useState(false)
  const [showLegend, setShowLegend] = useState(true)
  const [showGpsToast, setShowGpsToast] = useState(false)

  const [isDarkMode, setIsDarkMode] = useState(() => {
    const h = new Date().getHours(); return h >= 19 || h < 6
  })
  useEffect(() => {
    const check = () => { const h = new Date().getHours(); setIsDarkMode(h >= 19 || h < 6) }
    const id = setInterval(check, 60_000)
    return () => clearInterval(id)
  }, [])

  // ── Init Leaflet ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return
    initTrajetMap(mapRef.current, fixture, isFR).then((result) => {
      leafletRef.current     = result.leaflet
      mapInstanceRef.current = result.map
      donePolyRef.current    = result.donePoly
      remainPolyRef.current  = result.remainPoly
      cursorRef.current      = result.cursor
      departRef.current      = result.departMarker
      arriveeRef.current     = result.arriveeMarker
      // Curseur masqué par défaut — affiché seulement quand driverPos ou simulation active
      result.cursor.remove()
      cursorOnMapRef.current = false
      setMapReady(true)
    })
    return () => {
      destroyOffScreenButtons()
      mapInstanceRef.current?.remove()
      mapInstanceRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    mapRef.current?.classList.toggle('ms-dark', isDarkMode)
  }, [isDarkMode, mapReady])

  // ── Curseur conducteur depuis driverPos (SSE réel) ────────────────────────
  useEffect(() => {
    if (!mapReady || !leafletRef.current) return

    if (!driverPos) {
      // Masquer le curseur — conducteur sans localisation
      if (cursorOnMapRef.current) {
        cursorRef.current?.remove()
        cursorOnMapRef.current = false
      }
      return
    }

    const { lat, lng } = driverPos

    // Afficher le curseur si pas encore sur la carte
    if (!cursorOnMapRef.current && mapInstanceRef.current && cursorRef.current) {
      cursorRef.current.addTo(mapInstanceRef.current)
      cursorOnMapRef.current = true
    }

    createCursorIcon(0, cursorMode).then((icon) => {
      cursorRef.current?.setLatLng([lat, lng])
      cursorRef.current?.setIcon(icon)
    })

    // Trouve le point le plus proche sur la polyline pour splitter
    const pts = state.fixture.polyline
    let minD = Infinity; let splitIdx = 0
    for (let i = 0; i < pts.length; i++) {
      const dx = (pts[i].lng - lng) * 111000 * Math.cos(lat * Math.PI / 180)
      const dy = (pts[i].lat - lat) * 111000
      const d  = Math.sqrt(dx * dx + dy * dy)
      if (d < minD) { minD = d; splitIdx = i }
    }
    splitIdx = Math.max(1, Math.min(splitIdx, pts.length - 1))
    const pos = { lat, lng }
    donePolyRef.current?.setLatLngs([...pts.slice(0, splitIdx + 1), pos].map((p) => [p.lat, p.lng] as [number, number]))
    remainPolyRef.current?.setLatLngs([pos, ...pts.slice(splitIdx)].map((p) => [p.lat, p.lng] as [number, number]))

    if (autoCenter) mapInstanceRef.current?.panTo([lat, lng], { animate: true, duration: 0.8 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverPos, mapReady, cursorMode, autoCenter])

  // ── Fallback : simulation admin uniquement (driverPos absent + simulation active) ────────
  useEffect(() => {
    if (!mapReady || !leafletRef.current || driverPos) return
    const { positionActuelle, headingActuel, distanceParcourue, fixture: f } = state

    // Aucune simulation en cours → curseur reste masqué
    if (distanceParcourue === 0) return

    // Afficher le curseur si pas encore sur la carte
    if (!cursorOnMapRef.current && mapInstanceRef.current && cursorRef.current) {
      cursorRef.current.addTo(mapInstanceRef.current)
      cursorOnMapRef.current = true
    }

    createCursorIcon(headingActuel, cursorMode).then((icon) => {
      cursorRef.current?.setLatLng([positionActuelle.lat, positionActuelle.lng])
      cursorRef.current?.setIcon(icon)
    })

    const pts = f.polyline; let cum = 0; let splitIdx = 0
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = (pts[i+1].lng - pts[i].lng) * 111000 * Math.cos(pts[i].lat * Math.PI / 180)
      const dy = (pts[i+1].lat - pts[i].lat) * 111000
      cum += Math.sqrt(dx * dx + dy * dy)
      if (cum >= distanceParcourue) { splitIdx = i + 1; break }
    }
    splitIdx = Math.max(1, Math.min(splitIdx, pts.length - 1))
    const pos = positionActuelle
    donePolyRef.current?.setLatLngs([...pts.slice(0, splitIdx + 1), pos].map((p) => [p.lat, p.lng] as [number, number]))
    remainPolyRef.current?.setLatLngs([pos, ...pts.slice(splitIdx)].map((p) => [p.lat, p.lng] as [number, number]))

    if (autoCenter) mapInstanceRef.current?.panTo([pos.lat, pos.lng], { animate: true, duration: 0.8 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.positionActuelle, state.headingActuel, state.distanceParcourue, mapReady, cursorMode, autoCenter, driverPos])

  // ── Marqueur "Vous" (passager ou conducteur) ──────────────────────────────
  useEffect(() => {
    if (!mapReady || !leafletRef.current) return
    const L = leafletRef.current
    const map = mapInstanceRef.current
    if (!map) return

    if (!myPos) {
      youMarkerRef.current?.remove()
      youMarkerRef.current = null
      return
    }

    const { lat, lng } = myPos
    if (!youMarkerRef.current) {
      youMarkerRef.current = L.marker([lat, lng], { icon: makeYouIcon(L), zIndexOffset: 900 })
        .addTo(map)
        .bindTooltip(isFR ? 'Vous' : 'You', { permanent: true, direction: 'top', offset: [0, -14], className: 'ms-tooltip' })
    } else {
      youMarkerRef.current.setLatLng([lat, lng])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myPos, mapReady])

  // ── Mise à jour polylines + fitBounds quand l'itinéraire OSRM charge/change ─
  useEffect(() => {
    if (!mapReady || !leafletRef.current) return
    const L = leafletRef.current; const { fixture: f } = state
    const latlngs = f.polyline.map((p) => [p.lat, p.lng] as [number, number])

    // Redessiner la polyline restante avec la vraie géométrie OSRM
    remainPolyRef.current?.setLatLngs(latlngs)
    // Réinitialiser la portion parcourue au point de départ
    donePolyRef.current?.setLatLngs([[f.depart.lat, f.depart.lng]])

    departRef.current?.setLatLng([f.depart.lat, f.depart.lng])
    arriveeRef.current?.setLatLng([f.arrivee.lat, f.arrivee.lng])
    mapInstanceRef.current?.fitBounds(
      L.latLngBounds(latlngs),
      { padding: [44, 44], animate: true, duration: 1 },
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.fixture.id, state.fixture.distanceTotaleM, mapReady])

  // ── Bouton GPS — URL adaptée au rôle ──────────────────────────────────────
  const handleGPS = useCallback(() => {
    const ua = navigator.userAgent
    const currentPos = myPos ?? null

    let url: string
    if (role === 'driver') {
      const origin = currentPos ? `${currentPos.lat},${currentPos.lng}` : `${state.fixture.depart.lat},${state.fixture.depart.lng}`
      const dest   = arrivalCoords ? `${arrivalCoords.lat},${arrivalCoords.lng}` : `${state.fixture.arrivee.lat},${state.fixture.arrivee.lng}`
      if (/iPhone|iPad/.test(ua)) {
        url = `maps://?saddr=${origin}&daddr=${dest}&dirflg=d`
      } else if (/Android/.test(ua)) {
        url = `geo:0,0?q=${dest}`
      } else {
        url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}&travelmode=driving`
      }
    } else {
      // Passager : navigation vers le lieu de départ (pour rejoindre le pickup)
      const origin = currentPos ? `${currentPos.lat},${currentPos.lng}` : ''
      const dest   = departureCoords ? `${departureCoords.lat},${departureCoords.lng}` : `${state.fixture.depart.lat},${state.fixture.depart.lng}`
      if (/iPhone|iPad/.test(ua)) {
        url = `maps://?saddr=${origin}&daddr=${dest}&dirflg=w`
      } else {
        url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}&destination=${dest}&travelmode=walking`
      }
    }

    window.open(url, '_blank', 'noopener,noreferrer')
    setShowGpsToast(true)
    setTimeout(() => setShowGpsToast(false), 3500)
  }, [state, role, myPos, arrivalCoords, departureCoords])

  // ── ETA ───────────────────────────────────────────────────────────────────
  const mPerSec     = (state.fixture.vitesseMoyenneKmh * 1000) / 3600
  const secRestants = Math.max(0, (state.fixture.distanceTotaleM - state.distanceParcourue) / mPerSec)
  const distRestKm  = ((state.fixture.distanceTotaleM - state.distanceParcourue) / 1000).toFixed(1)
  const minRest     = Math.floor(secRestants / 60)
  const secRest     = Math.floor(secRestants % 60)
  const etaStr      = minRest > 0 ? `${minRest} min ${secRest > 0 ? secRest + ' s' : ''}` : `${Math.floor(secRestants)} s`

  return (
    <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 20px rgba(8,49,110,0.13)', background: isDarkMode ? '#0e1b2e' : '#eef2f8' }}>

      <div ref={mapRef} style={{ width: '100%', height: '60vh' }} />

      {/* Badge route haut gauche */}
      <div style={{
        position: 'absolute', top: 12, left: 12, zIndex: 500,
        background: isDarkMode ? 'rgba(14,27,46,0.92)' : 'rgba(255,255,255,0.97)',
        border: `1px solid ${isDarkMode ? 'rgba(200,214,234,0.12)' : 'rgba(8,49,110,0.1)'}`,
        borderRadius: 10, padding: '7px 13px',
        display: 'flex', alignItems: 'center', gap: 8, pointerEvents: 'none', backdropFilter: 'blur(4px)',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: MAP_COLORS.depart }} />
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, color: isDarkMode ? '#90b8e8' : MAP_COLORS.brand }}>
          {state.fixture.labelDepart}
        </span>
        <span style={{ color: isDarkMode ? '#4a6080' : '#b0bfd8', fontSize: 13 }}>→</span>
        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, color: isDarkMode ? '#ff7090' : MAP_COLORS.arrivee }}>
          {state.fixture.labelArrivee}
        </span>
      </div>

      {/* Badge ETA haut droite */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 500,
        background: driverPos ? MAP_COLORS.brand : 'rgba(120,144,184,0.85)',
        color: '#fff', fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12,
        padding: '6px 14px', borderRadius: 20,
        boxShadow: '0 2px 10px rgba(8,49,110,0.3)',
        display: 'flex', alignItems: 'center', gap: 6, pointerEvents: 'none',
      }}>
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        {!driverPos
          ? (isFR ? 'En attente du conducteur…' : 'Waiting for driver…')
          : state.estTermine
            ? (isFR ? 'Arrivé' : 'Arrived')
            : `${distRestKm} km · ${etaStr}`}
      </div>

      {/* Contrôles bas */}
      <TrajetMapControls
        autoCenter={autoCenter}
        onToggleAutoCenter={() => {
          if (!autoCenter) {
            const pos = driverPos ?? state.positionActuelle
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

      {/* Légende */}
      <TrajetMapLegend
        show={showLegend}
        onToggle={() => setShowLegend((v) => !v)}
        isDarkMode={isDarkMode}
        isFR={isFR}
        labelDepart={state.fixture.labelDepart}
        labelArrivee={state.fixture.labelArrivee}
      />

      {/* Toast GPS */}
      {showGpsToast && (
        <div style={{
          position: 'absolute', bottom: 100, right: 12, zIndex: 600,
          background: MAP_COLORS.brand, color: '#fff', borderRadius: 10,
          padding: '10px 16px', fontSize: 12, fontWeight: 600,
          boxShadow: '0 4px 16px rgba(8,49,110,0.3)',
          display: 'flex', alignItems: 'center', gap: 8, animation: 'ms-fadein .3s ease',
        }}>
          <FaMapMarkerAlt size={12} />
          {role === 'driver'
            ? (isFR ? 'Ouverture de Google Maps…' : 'Opening Google Maps…')
            : (isFR ? 'Navigation vers le départ…' : 'Navigating to pickup…')}
        </div>
      )}

      {/* Loader initial */}
      {!mapReady && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 400, background: isDarkMode ? '#0e1b2e' : '#eef2f8',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
        }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', border: '3px solid rgba(8,49,110,0.1)', borderTop: `3px solid ${MAP_COLORS.brand}`, animation: 'ms-spin .8s linear infinite' }} />
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
