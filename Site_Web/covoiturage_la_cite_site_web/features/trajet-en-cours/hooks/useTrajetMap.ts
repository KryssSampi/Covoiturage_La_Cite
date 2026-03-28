// features/trajet-en-cours/hooks/useTrajetMap.ts
// Gère la polyline OSRM et le recalcul d'itinéraire.
// La simulation est DÉSACTIVÉE par défaut — la carte affiche les positions GPS réelles.
// Admin uniquement : appeler window.__simulateTrajet?.() dans la console pour activer.
'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import type {
  TrajetMapFixture,
  TrajetMapState,
  MapConfig,
  TrajetMapSocketPayload,
  TrajetMapSocketHook,
} from '../types/map.types'
import {
  polylineDistanceM,
  interpolateOnPolyline,
  fixtureMapPrincipale,
} from '../fixtures/map.fixtures'
import {
  buildState,
  fetchOsrmRoute,
} from '../utils/trajet-map.utils'

// HOOK WEBSOCKET (prêt, non connecté)
export function useTrajetMapSocket(): TrajetMapSocketHook {
  const wsRef = useRef<WebSocket | null>(null)
  const cbRef = useRef<((p: TrajetMapSocketPayload) => void) | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const connect = useCallback((tripId: string, url: string) => {
    if (wsRef.current) wsRef.current.close()
    const ws = new WebSocket(`${url}?tripId=${encodeURIComponent(tripId)}`)
    ws.onopen  = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onerror = () => setIsConnected(false)
    ws.onmessage = (e: MessageEvent) => {
      try {
        const payload: TrajetMapSocketPayload = JSON.parse(e.data as string)
        cbRef.current?.(payload)
      } catch { /* payload invalide */ }
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

// HOOK PRINCIPAL : useTrajetMap
export interface UseTrajetMapReturn {
  state: TrajetMapState
  config: MapConfig
  setConfig: React.Dispatch<React.SetStateAction<MapConfig>>
  updateFromSocket: (payload: TrajetMapSocketPayload) => void
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

  const socket = useTrajetMapSocket()

  // ── Simulation (désactivée par défaut) ────────────────────────────────────
  // Accès admin : window.__simulateTrajet?.() dans la console du navigateur.
  const startSimulation = useCallback((st: TrajetMapState) => {
    if (simulRef.current) clearInterval(simulRef.current)
    const { fixture } = st
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
        return {
          ...prev,
          positionActuelle: latlng,
          headingActuel: heading,
          distanceParcourue: Math.min(newDist, distTotal),
          pourcentageComplete: Math.min((newDist / distTotal) * 100, 100),
          estTermine: done,
        }
      })
    }, 1000)
  }, [])

  // Expose la simulation à la console admin — jamais démarrée automatiquement
  useEffect(() => {
    if (typeof window === 'undefined') return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__simulateTrajet = () => {
      console.info('[Admin] Simulation démarrée')
      startSimulation(stateRef.current)
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).__stopSimulation = () => {
      if (simulRef.current) clearInterval(simulRef.current)
      console.info('[Admin] Simulation arrêtée')
    }
    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__simulateTrajet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).__stopSimulation
    }
  }, [startSimulation])

  // Stoppe la simulation si le trajet est terminé
  useEffect(() => {
    if (!state.estTermine) return
    if (simulRef.current) clearInterval(simulRef.current)
  }, [state.estTermine])

  // Remplace la polyline initiale par la route OSRM (vraies routes)
  const osrmInitDone = useRef(false)
  useEffect(() => {
    if (osrmInitDone.current) return
    osrmInitDone.current = true

    const { depart, arrivee } = fixtureInitiale
    fetchOsrmRoute(depart, arrivee).then((osrmPoly) => {
      if (!osrmPoly || osrmPoly.length < 2) return
      setState((prev) => {
        const updatedFixture: TrajetMapFixture = {
          ...prev.fixture,
          polyline: osrmPoly,
          distanceTotaleM: polylineDistanceM(osrmPoly),
        }
        return buildState(updatedFixture)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Mise à jour depuis position réelle (SSE / socket)
  const updateFromSocket = useCallback((payload: TrajetMapSocketPayload) => {
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

  // Recalcul OSRM depuis position actuelle (déviation GPS)
  const recalculerItineraire = useCallback(async () => {
    const current = stateRef.current
    if (current.estTermine) return
    setIsRecalculating(true)
    try {
      const newPoly = await fetchOsrmRoute(current.positionActuelle, current.fixture.arrivee)
      if (!newPoly || newPoly.length < 2) return
      const distTotale = polylineDistanceM(newPoly)
      const updatedFixture: TrajetMapFixture = {
        ...current.fixture,
        polyline: newPoly,
        distanceTotaleM: distTotale,
      }
      setState({
        ...buildState(updatedFixture),
        positionActuelle: current.positionActuelle,
        headingActuel: current.headingActuel,
        distanceParcourue: 0,
        pourcentageComplete: 0,
        prochainFixture: current.prochainFixture,
      })
    } finally {
      setIsRecalculating(false)
    }
  }, [])

  return { state, config, setConfig, updateFromSocket, recalculerItineraire, isRecalculating, socket }
}
