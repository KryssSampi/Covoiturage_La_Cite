'use client'
// ─────────────────────────────────────────────────────────────────────────────
// app/page.tsx
// Page unique — orchestre la carte + le bridge + le DevPanel
// ─────────────────────────────────────────────────────────────────────────────
import dynamic from 'next/dynamic'
import { useState, useEffect, useCallback } from 'react'
import type { MapCircuit, MapConfig, BridgeIncoming } from '@/types'
import { DEFAULT_MAP_CONFIG } from '@/types'
import { initBridge, sendToBridge, exposeBridgeGlobally } from '@/lib/bridge'

// Leaflet ne supporte pas le SSR — chargement dynamique obligatoire
const MapDisplay = dynamic(() => import('@/components/MapDisplay'), { ssr: false })
const DevPanel   = dynamic(() => import('@/components/DevPanel'),   { ssr: false })

export default function MapPage() {
  const [circuits,    setCircuits]    = useState<MapCircuit[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [config,      setConfig]      = useState<MapConfig>(DEFAULT_MAP_CONFIG)

  // ── Handlers partagés avec le bridge et le DevPanel ───────────────────────

  const handleSetCircuits = useCallback((newCircuits: MapCircuit[], startIndex = 0) => {
    setCircuits(newCircuits)
    setActiveIndex(startIndex)
    sendToBridge({ type: 'CIRCUITS_LOADED', count: newCircuits.length })
  }, [])

  const handleSelectCircuit = useCallback((index: number) => {
    setActiveIndex(index)
    if (circuits[index]) {
      sendToBridge({ type: 'CIRCUIT_SELECTED', index, circuit: circuits[index] })
    }
  }, [circuits])

  const handleSetConfig = useCallback((partial: Partial<MapConfig>) => {
    setConfig((prev) => ({ ...prev, ...partial }))
  }, [])

  const handleClear = useCallback(() => {
    setCircuits([])
    setActiveIndex(0)
  }, [])

  // ── Init bridge (une seule fois côté client) ──────────────────────────────
  useEffect(() => {
    const onMessage = (msg: BridgeIncoming) => {
      switch (msg.type) {
        case 'SET_CIRCUITS':
          handleSetCircuits(msg.circuits, msg.activeIndex ?? 0)
          break
        case 'SELECT_CIRCUIT':
          handleSelectCircuit(msg.index)
          break
        case 'SET_CONFIG':
          handleSetConfig(msg.config)
          break
        case 'CLEAR_MAP':
          handleClear()
          break
        case 'FLY_TO':
          // FlyTo est géré directement dans MapDisplay via l'event system
          // On l'expose ici pour que le DevPanel puisse logger
          break
      }
    }

    initBridge(onMessage)

    // Expose window.mapBridge pour tests console
    exposeBridgeGlobally(
      (c) => handleSetCircuits(c, 0),
      handleSelectCircuit,
    )
  }, [handleSetCircuits, handleSelectCircuit, handleSetConfig, handleClear])

  return (
    <main style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {/* Carte plein écran */}
      <MapDisplay
        circuits={circuits}
        activeIndex={activeIndex}
        config={config}
        onCircuitClick={handleSelectCircuit}
      />

      {/* Dev panel flottant — masqué en production WebView via ?dev=false */}
      {typeof window === 'undefined' || !window.location.search.includes('dev=false') ? (
        <DevPanel
          circuits={circuits}
          activeIndex={activeIndex}
          config={config}
          onSetCircuits={handleSetCircuits}
          onSelectCircuit={handleSelectCircuit}
          onSetConfig={handleSetConfig}
          onClear={handleClear}
        />
      ) : null}
    </main>
  )
}
