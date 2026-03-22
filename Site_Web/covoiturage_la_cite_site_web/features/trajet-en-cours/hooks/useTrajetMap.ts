// ─────────────────────────────────────────────────────────────────────────────
// features/trajet-en-cours/hooks/useTrajetMap.ts
// Gère la simulation temps-réel de la position, la pré-génération du prochain
// trajet, la reconnexion WebSocket (préparé, non connecté) et le recalcul
// OSRM de l'itinéraire.
// ─────────────────────────────────────────────────────────────────────────────
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type {
  TrajetMapFixture,
  TrajetMapState,
  MapConfig,
  TrajetMapSocketPayload,
  TrajetMapSocketHook,
  LatLng,
  WaypointWithDistance,
} from '../types/map.types'
import {
  haversineM,
  bearingDeg,
  polylineDistanceM,
  interpolateOnPolyline,
  fixtureMapPrincipale,
  genererNouvelleFixtureMap,
} from '../fixtures/map.fixtures'

// ── Enrichit la polyline avec distances cumulées + cap ───────────────────────
function enrichPolyline(pts: LatLng[]): WaypointWithDistance[] {
  let cum = 0
  return pts.map((p, i) => {
    if (i > 0) cum += haversineM(pts[i - 1], p)
    return {
      latlng: p,
      distFromStart: cum,
      heading: i < pts.length - 1 ? bearingDeg(p, pts[i + 1]) : bearingDeg(pts[i - 1], p),
    }
  })
}

// ── Subdivise un segment trop long pour plus de fluidité ────────────────────
function densifyPolyline(pts: LatLng[], maxSegM = 150): LatLng[] {
  const out: LatLng[] = [pts[0]]
  for (let i = 0; i < pts.length - 1; i++) {
    const d = haversineM(pts[i], pts[i + 1])
    if (d > maxSegM) {
      const n = Math.ceil(d / maxSegM)
      for (let j = 1; j <= n; j++) {
        const t = j / n
        out.push({
          lat: pts[i].lat + t * (pts[i + 1].lat - pts[i].lat),
          lng: pts[i].lng + t * (pts[i + 1].lng - pts[i].lng),
        })
      }
    } else {
      out.push(pts[i + 1])
    }
  }
  return out
}

// ── Construit l'état initial pour une fixture ────────────────────────────────
function buildState(fixture: TrajetMapFixture): TrajetMapState {
  const densePoly = densifyPolyline(fixture.polyline)
  const distTotale = polylineDistanceM(densePoly)
  const waypoints = enrichPolyline(densePoly)
  return {
    fixture: { ...fixture, polyline: densePoly, distanceTotaleM: distTotale },
    waypoints,
    positionActuelle: densePoly[0],
    headingActuel: waypoints[0]?.heading ?? 0,
    distanceParcourue: 0,
    pourcentageComplete: 0,
    estTermine: false,
    prochainFixture: null,
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HOOK WEBSOCKET (prêt, non connecté)
// Pour l'activer : connecter dans TrajetMap et passer les updates à
// updateFromSocket(payload) au lieu du simulateur.
// ════════════════════════════════════════════════════════════════════════════
export function useTrajetMapSocket(): TrajetMapSocketHook {
  const wsRef = useRef<WebSocket | null>(null)
  const cbRef = useRef<((p: TrajetMapSocketPayload) => void) | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connect = useCallback((tripId: string, url: string) => {
    if (wsRef.current) wsRef.current.close()
    const ws = new WebSocket(`${url}?tripId=${encodeURIComponent(tripId)}`)
    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onerror = () => setIsConnected(false)
    ws.onmessage = (e: MessageEvent) => {
      try {
        const payload: TrajetMapSocketPayload = JSON.parse(e.data as string)
        cbRef.current?.(payload)
      } catch { /* payload invalide ignoré */ }
    }
    wsRef.current = ws
  }, [])

  const disconnect = useCallback(() => {
    wsRef.current?.close()
    wsRef.current = null
  }, [])

  const onPositionUpdate = useCallback((cb: (p: TrajetMapSocketPayload) => void) => {
    cbRef.current = cb
  }, [])

  useEffect(() => () => { wsRef.current?.close() }, [])

  return { isConnected, connect, disconnect, onPositionUpdate }
}

// ════════════════════════════════════════════════════════════════════════════
// HOOK OSRM – recalcul d'itinéraire
// Appelé quand le GPS recalcule (conducteur dévie de la route)
// ════════════════════════════════════════════════════════════════════════════
export async function fetchOsrmRoute(
  from: LatLng,
  to: LatLng,
): Promise<LatLng[] | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json() as {
      routes?: Array<{ geometry: { coordinates: number[][] } }>
    }
    const coords = data.routes?.[0]?.geometry?.coordinates
    if (!coords) return null
    return coords.map(([lng, lat]) => ({ lat, lng }))
  } catch {
    return null
  }
}

// ════════════════════════════════════════════════════════════════════════════
// HOOK PRINCIPAL : useTrajetMap
// ════════════════════════════════════════════════════════════════════════════
export interface UseTrajetMapReturn {
  state: TrajetMapState
  config: MapConfig
  setConfig: React.Dispatch<React.SetStateAction<MapConfig>>
  /** Utilisé par WebSocket pour injecter une position externe */
  updateFromSocket: (payload: TrajetMapSocketPayload) => void
  /** Force le recalcul OSRM depuis la position courante */
  recalculerItineraire: () => Promise<void>
  isRecalculating: boolean
  socket: TrajetMapSocketHook
}

export function useTrajetMap(
  fixtureInitiale: TrajetMapFixture = fixtureMapPrincipale,
): UseTrajetMapReturn {
  const [state, setState] = useState<TrajetMapState>(() => buildState(fixtureInitiale))
  const [config, setConfig] = useState<MapConfig>({
    cursorMode: 'arrow',
    showLegend: true,
    autoCenter: true,
    zoom: 13,
  })
  const [isRecalculating, setIsRecalculating] = useState(false)

  const simulRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef<TrajetMapState>(state)
  stateRef.current = state
  // Empêche de lancer la pré-génération async en double
  const preGenRef = useRef(false)

  const socket = useTrajetMapSocket()

  // ── Lance la simulation ────────────────────────────────────────────────────
  const startSimulation = useCallback((st: TrajetMapState) => {
    if (simulRef.current) clearInterval(simulRef.current)

    const { fixture } = st
    // Mètres parcourus par seconde à la vitesse moyenne
    const mPerSec = (fixture.vitesseMoyenneKmh * 1000) / 3600

    simulRef.current = setInterval(() => {
      setState((prev) => {
        if (prev.estTermine) return prev

        const newDist = prev.distanceParcourue + mPerSec
        const distTotal = prev.fixture.distanceTotaleM
        const done = newDist >= distTotal

        const { latlng, heading } = interpolateOnPolyline(
          prev.fixture.polyline,
          Math.min(newDist, distTotal),
        )

        const pct = Math.min((newDist / distTotal) * 100, 100)

        // ── Pré-génère le prochain trajet à 60 sec de la fin ──────────────
        const secRestantes = done ? 0 : (distTotal - newDist) / mPerSec
        const prochainFixture = prev.prochainFixture

        // Lance la pré-génération async si nécessaire (hors setState)
        if (!prochainFixture && !preGenRef.current && secRestantes <= 60 && secRestantes > 0) {
          preGenRef.current = true
          genererNouvelleFixtureMap(prev.fixture.labelDepart).then((nextFixture) => {
            setState((s) => ({ ...s, prochainFixture: nextFixture }))
          })
        }

        return {
          ...prev,
          positionActuelle: latlng,
          headingActuel: heading,
          distanceParcourue: Math.min(newDist, distTotal),
          pourcentageComplete: pct,
          estTermine: done,
          prochainFixture,
        }
      })
    }, 1000)
  }, [])

  // ── Démarre la simulation au montage ──────────────────────────────────────
  useEffect(() => {
    startSimulation(state)
    return () => { if (simulRef.current) clearInterval(simulRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Remplace la polyline initiale par la route OSRM (suit les vraies routes) ─
  const osrmInitDone = useRef(false)
  useEffect(() => {
    if (osrmInitDone.current) return
    osrmInitDone.current = true

    const { depart, arrivee } = fixtureInitiale
    fetchOsrmRoute(depart, arrivee).then((osrmPoly) => {
      if (!osrmPoly || osrmPoly.length < 2) return // garde la polyline par défaut

      setState((prev) => {
        // Conserve la progression actuelle (ratio) sur la nouvelle polyline
        const ratio = prev.fixture.distanceTotaleM > 0
          ? prev.distanceParcourue / prev.fixture.distanceTotaleM
          : 0
        const updatedFixture: TrajetMapFixture = {
          ...prev.fixture,
          polyline: osrmPoly,
          distanceTotaleM: polylineDistanceM(osrmPoly),
        }
        const newState = buildState(updatedFixture)
        // Repositionne le curseur au bon endroit de la nouvelle polyline
        const newDist = ratio * newState.fixture.distanceTotaleM
        const { latlng, heading } = interpolateOnPolyline(
          newState.fixture.polyline,
          newDist,
        )
        const updated: TrajetMapState = {
          ...newState,
          positionActuelle: latlng,
          headingActuel: heading,
          distanceParcourue: newDist,
          pourcentageComplete: ratio * 100,
          prochainFixture: prev.prochainFixture,
        }
        // Relance la simulation sur la nouvelle polyline
        startSimulation(updated)
        return updated
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Quand le trajet est terminé → charge le suivant après 2 sec ───────────
  useEffect(() => {
    if (!state.estTermine) return
    if (simulRef.current) clearInterval(simulRef.current)

    const t = setTimeout(async () => {
      const next = state.prochainFixture ?? await genererNouvelleFixtureMap()
      const newState = buildState(next)
      preGenRef.current = false
      setState(newState)
      startSimulation(newState)
    }, 2500)
    return () => clearTimeout(t)
  }, [state.estTermine, state.prochainFixture, startSimulation])

  // ── Injection WebSocket (future) ──────────────────────────────────────────
  const updateFromSocket = useCallback((payload: TrajetMapSocketPayload) => {
    // Stoppe la simulation locale et applique la position reçue
    if (simulRef.current) clearInterval(simulRef.current)
    setState((prev) => ({
      ...prev,
      positionActuelle: { lat: payload.lat, lng: payload.lng },
      headingActuel: payload.heading,
      distanceParcourue: payload.distanceParcourue,
      pourcentageComplete: Math.min(
        (payload.distanceParcourue / prev.fixture.distanceTotaleM) * 100, 100,
      ),
    }))
  }, [])

  // ── Recalcul OSRM (déviation GPS) ────────────────────────────────────────
  const recalculerItineraire = useCallback(async () => {
    const current = stateRef.current
    if (current.estTermine) return
    setIsRecalculating(true)
    try {
      const newPoly = await fetchOsrmRoute(
        current.positionActuelle,
        current.fixture.arrivee,
      )
      if (!newPoly || newPoly.length < 2) return

      // Reconstruit la fixture avec la nouvelle polyline
      const distTotale = polylineDistanceM(newPoly)
      const updatedFixture: TrajetMapFixture = {
        ...current.fixture,
        polyline: newPoly,
        distanceTotaleM: distTotale,
      }
      const newState: TrajetMapState = {
        ...buildState(updatedFixture),
        positionActuelle: current.positionActuelle,
        headingActuel: current.headingActuel,
        distanceParcourue: 0,
        pourcentageComplete: 0,
        prochainFixture: current.prochainFixture,
      }
      setState(newState)
      startSimulation(newState)
    } finally {
      setIsRecalculating(false)
    }
  }, [startSimulation])

  return { state, config, setConfig, updateFromSocket, recalculerItineraire, isRecalculating, socket }
}
