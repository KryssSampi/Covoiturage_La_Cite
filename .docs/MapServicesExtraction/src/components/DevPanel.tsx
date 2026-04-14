'use client'
// ─────────────────────────────────────────────────────────────────────────────
// components/DevPanel.tsx
// Panneau de contrôle flottant — tests en temps réel sans quitter le navigateur
// Simule exactement ce que C# enverrait via postMessage
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useCallback } from 'react'
import type { MapCircuit, MapConfig } from '@/types'
import { FIXTURE_CIRCUITS, CIRCUIT_LABELS, formatDuration, formatDistance } from '@/fixtures/circuits.fixtures'
import { fetchCircuits } from '@/lib/routing'

interface Props {
  circuits:    MapCircuit[]
  activeIndex: number
  config:      MapConfig
  onSetCircuits:   (c: MapCircuit[], i: number) => void
  onSelectCircuit: (i: number) => void
  onSetConfig:     (c: Partial<MapConfig>) => void
  onClear:         () => void
}

const TILE_OPTIONS: MapConfig['tileProvider'][] = ['carto-voyager', 'carto-positron', 'osm']
const TILE_LABELS: Record<MapConfig['tileProvider'], string> = {
  'carto-voyager':  'CARTO Voyager',
  'carto-positron': 'CARTO Positron',
  'osm':            'OpenStreetMap',
}

export default function DevPanel({
  circuits, activeIndex, config,
  onSetCircuits, onSelectCircuit, onSetConfig, onClear,
}: Props) {
  const [open,     setOpen]     = useState(true)
  const [section,  setSection]  = useState<'circuits' | 'config' | 'bridge'>('circuits')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)
  const [log,      setLog]      = useState<string[]>([])

  // Coordonnées OSRM [lng, lat]
  const [depLng,   setDepLng]   = useState('-75.6557')
  const [depLat,   setDepLat]   = useState('45.4349')
  const [arrLng,   setArrLng]   = useState('-75.6268')
  const [arrLat,   setArrLat]   = useState('45.4395')
  const [depLabel, setDepLabel] = useState('Avenue de la Paix, Vanier')
  const [arrLabel, setArrLabel] = useState('Campus La Cité')

  const addLog = useCallback((msg: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 30))
  }, [])

  const loadFixtures = useCallback(() => {
    onSetCircuits(FIXTURE_CIRCUITS, 0)
    addLog(`✓ Fixtures chargées — ${FIXTURE_CIRCUITS.length} circuits`)
  }, [onSetCircuits, addLog])

  const fetchFromOsrm = useCallback(async () => {
    setLoading(true); setError(null)
    try {
      const dep: [number, number] = [parseFloat(depLng), parseFloat(depLat)]
      const arr: [number, number] = [parseFloat(arrLng), parseFloat(arrLat)]
      addLog(`⏳ OSRM fetch ${dep} → ${arr}…`)
      const result = await fetchCircuits(dep, arr, depLabel, arrLabel)
      onSetCircuits(result, 0)
      addLog(`✓ ${result.length} circuits reçus d'OSRM`)
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg); addLog(`✗ Erreur OSRM : ${msg}`)
    } finally {
      setLoading(false)
    }
  }, [depLng, depLat, arrLng, arrLat, depLabel, arrLabel, onSetCircuits, addLog])

  const selectCircuit = useCallback((i: number) => {
    onSelectCircuit(i)
    addLog(`→ Circuit ${i} sélectionné (${CIRCUIT_LABELS[i] ?? `#${i}`})`)
  }, [onSelectCircuit, addLog])

  // Styles inline pour ne pas dépendre de Tailwind dans ce composant
  const panel: React.CSSProperties = {
    position: 'fixed', top: 16, right: 16, zIndex: 9000,
    width: 300, maxHeight: 'calc(100vh - 32px)',
    background: 'rgba(255,255,255,0.97)',
    borderRadius: 14,
    boxShadow: '0 4px 24px rgba(8,49,110,0.18)',
    border: '1.5px solid rgba(8,49,110,0.12)',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 12,
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  }
  const header: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px',
    background: '#08316e', color: 'white',
    cursor: 'pointer', userSelect: 'none',
  }
  const body: React.CSSProperties = {
    overflowY: 'auto', flex: 1, padding: '10px 12px',
  }
  const tabBar: React.CSSProperties = {
    display: 'flex', gap: 4, padding: '8px 12px 0',
    borderBottom: '1px solid rgba(8,49,110,0.1)',
  }
  const tab = (active: boolean): React.CSSProperties => ({
    padding: '4px 10px', borderRadius: '6px 6px 0 0',
    background: active ? '#08316e' : 'transparent',
    color: active ? 'white' : '#08316e',
    border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 11,
  })
  const btn = (color = '#08316e', full = false): React.CSSProperties => ({
    padding: '6px 12px', borderRadius: 8,
    background: color, color: 'white', border: 'none',
    cursor: 'pointer', fontWeight: 700, fontSize: 11,
    width: full ? '100%' : undefined, marginBottom: 4,
  })
  const input: React.CSSProperties = {
    padding: '4px 8px', borderRadius: 6,
    border: '1.5px solid rgba(8,49,110,0.15)',
    fontSize: 11, width: '100%', marginBottom: 4,
  }
  const label: React.CSSProperties = {
    fontSize: 10, color: '#7a90b8', marginBottom: 2, display: 'block',
  }
  const circuitCard = (active: boolean): React.CSSProperties => ({
    padding: '7px 10px', borderRadius: 8, marginBottom: 4, cursor: 'pointer',
    border: `1.5px solid ${active ? '#08316e' : 'rgba(8,49,110,0.12)'}`,
    background: active ? 'rgba(8,49,110,0.06)' : 'white',
  })

  return (
    <div style={panel}>
      {/* Header */}
      <div style={header} onClick={() => setOpen((o) => !o)}>
        <span style={{ fontWeight: 800, fontSize: 13 }}>🗺 Dev Panel</span>
        <span style={{ opacity: 0.8, fontSize: 11 }}>{open ? '▲ Réduire' : '▼ Ouvrir'}</span>
      </div>

      {open && (
        <>
          {/* Tab bar */}
          <div style={tabBar}>
            {(['circuits', 'config', 'bridge'] as const).map((s) => (
              <button key={s} style={tab(section === s)} onClick={() => setSection(s)}>
                {s === 'circuits' ? '🛣 Circuits' : s === 'config' ? '⚙️ Config' : '📡 Bridge'}
              </button>
            ))}
          </div>

          <div style={body}>

            {/* ─── CIRCUITS ─── */}
            {section === 'circuits' && (
              <>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10, marginTop: 4 }}>
                  <button style={btn('#0aad6a')} onClick={loadFixtures}>
                    📦 Fixtures
                  </button>
                  <button style={btn('#e03050')} onClick={onClear}>
                    🗑 Vider
                  </button>
                </div>

                <div style={{ borderTop: '1px solid rgba(8,49,110,0.08)', paddingTop: 8, marginBottom: 8 }}>
                  <div style={{ fontWeight: 700, color: '#08316e', marginBottom: 6, fontSize: 11 }}>
                    Fetch OSRM en direct
                  </div>
                  <span style={label}>Départ [lng, lat]</span>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    <input style={{ ...input, width: '50%', margin: 0 }} value={depLng} onChange={(e) => setDepLng(e.target.value)} placeholder="lng" />
                    <input style={{ ...input, width: '50%', margin: 0 }} value={depLat} onChange={(e) => setDepLat(e.target.value)} placeholder="lat" />
                  </div>
                  <span style={label}>Label départ</span>
                  <input style={input} value={depLabel} onChange={(e) => setDepLabel(e.target.value)} />
                  <span style={label}>Arrivée [lng, lat]</span>
                  <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                    <input style={{ ...input, width: '50%', margin: 0 }} value={arrLng} onChange={(e) => setArrLng(e.target.value)} placeholder="lng" />
                    <input style={{ ...input, width: '50%', margin: 0 }} value={arrLat} onChange={(e) => setArrLat(e.target.value)} placeholder="lat" />
                  </div>
                  <span style={label}>Label arrivée</span>
                  <input style={input} value={arrLabel} onChange={(e) => setArrLabel(e.target.value)} />
                  <button style={btn(loading ? '#7a90b8' : '#08316e', true)} onClick={fetchFromOsrm} disabled={loading}>
                    {loading ? '⏳ Calcul…' : '🔍 Calculer circuits'}
                  </button>
                  {error && <div style={{ color: '#e03050', fontSize: 10, marginTop: 4 }}>✗ {error}</div>}
                </div>

                {/* Liste des circuits chargés */}
                {circuits.length > 0 && (
                  <div>
                    <div style={{ fontWeight: 700, color: '#08316e', marginBottom: 6, fontSize: 11 }}>
                      {circuits.length} circuit{circuits.length > 1 ? 's' : ''} chargé{circuits.length > 1 ? 's' : ''}
                    </div>
                    {circuits.map((c, i) => (
                      <div key={i} style={circuitCard(i === activeIndex)} onClick={() => selectCircuit(i)}>
                        <div style={{ fontWeight: 700, color: i === activeIndex ? '#08316e' : '#0d1f3c', fontSize: 11 }}>
                          {i === activeIndex ? '● ' : '○ '}
                          {CIRCUIT_LABELS[i] ?? `Circuit ${i}`}
                        </div>
                        <div style={{ color: '#7a90b8', fontSize: 10, marginTop: 2 }}>
                          {formatDuration(c.duration)} · {formatDistance(c.distance)}
                        </div>
                        <div style={{ color: '#aaa', fontSize: 10, marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {c.summary}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ─── CONFIG ─── */}
            {section === 'config' && (
              <>
                <div style={{ marginTop: 4 }}>
                  <span style={{ ...label, fontWeight: 700, color: '#08316e' }}>Fond de carte</span>
                  {TILE_OPTIONS.map((t) => (
                    <button
                      key={t}
                      style={{
                        ...btn(config.tileProvider === t ? '#08316e' : 'white'),
                        color: config.tileProvider === t ? 'white' : '#08316e',
                        border: '1.5px solid rgba(8,49,110,0.2)',
                        width: '100%', marginBottom: 4,
                      }}
                      onClick={() => onSetConfig({ tileProvider: t })}
                    >
                      {TILE_LABELS[t]}
                    </button>
                  ))}
                </div>

                <div style={{ borderTop: '1px solid rgba(8,49,110,0.08)', paddingTop: 8, marginTop: 4 }}>
                  <span style={{ ...label, fontWeight: 700, color: '#08316e' }}>Couches</span>
                  {(
                    [
                      ['showCampusZones',    '🎓 Zones campus'],
                      ['showBusStops',       '🚌 Arrêts bus'],
                      ['showGasStations',    '⛽ Stations-service'],
                      ['showPublicServices', '🏛 Services publics'],
                    ] as [keyof MapConfig, string][]
                  ).map(([key, lbl]) => (
                    <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={config[key] as boolean}
                        onChange={(e) => onSetConfig({ [key]: e.target.checked })}
                      />
                      <span style={{ fontSize: 11 }}>{lbl}</span>
                    </label>
                  ))}
                </div>
              </>
            )}

            {/* ─── BRIDGE LOG ─── */}
            {section === 'bridge' && (
              <>
                <div style={{ marginTop: 4, marginBottom: 6 }}>
                  <div style={{ fontWeight: 700, color: '#08316e', fontSize: 11, marginBottom: 4 }}>
                    Journal des messages bridge
                  </div>
                  <div style={{ fontSize: 10, color: '#7a90b8', marginBottom: 6 }}>
                    En production, C# envoie via :<br/>
                    <code style={{ background: 'rgba(8,49,110,0.06)', padding: '2px 4px', borderRadius: 4 }}>
                      WebView.CoreWebView2.PostWebMessageAsString(json)
                    </code>
                  </div>
                  <div style={{ fontSize: 10, color: '#7a90b8', marginBottom: 8 }}>
                    Depuis la console browser :<br/>
                    <code style={{ background: 'rgba(8,49,110,0.06)', padding: '2px 4px', borderRadius: 4 }}>
                      window.mapBridge.send({'{'}&quot;type&quot;:&quot;SELECT_CIRCUIT&quot;,&quot;index&quot;:1{'}'})
                    </code>
                  </div>
                </div>
                <div
                  style={{
                    background: '#0d1f3c', color: '#c8d6ea', borderRadius: 8,
                    padding: '8px 10px', fontSize: 10, lineHeight: 1.7,
                    maxHeight: 300, overflowY: 'auto', fontFamily: 'monospace',
                  }}
                >
                  {log.length === 0 && <span style={{ color: '#4a6080' }}>— aucun message —</span>}
                  {log.map((l, i) => <div key={i}>{l}</div>)}
                </div>
                <button style={{ ...btn('#7a90b8', true), marginTop: 8 }} onClick={() => setLog([])}>
                  🗑 Vider le log
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
