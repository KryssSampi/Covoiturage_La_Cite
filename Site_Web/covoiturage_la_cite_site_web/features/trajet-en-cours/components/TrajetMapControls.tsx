// ─────────────────────────────────────────────────────────────────────────────
// features/trajet-en-cours/components/TrajetMapControls.tsx
// Barre de contrôles (recentrer, curseur, recalculer, GPS) pour TrajetMap
// ─────────────────────────────────────────────────────────────────────────────
import { FaCrosshairs, FaCar, FaArrowUp, FaSyncAlt } from 'react-icons/fa'
import { MAP_COLORS } from '@/features/map-service'
import type { CursorMode } from '@/features/map-service'

interface TrajetMapControlsProps {
  autoCenter:           boolean
  onToggleAutoCenter:   () => void
  cursorMode:           CursorMode
  onToggleCursorMode:   () => void
  recalculerItineraire: () => void
  isRecalculating:      boolean
  onGPS:                () => void
  role:                 'driver' | 'passenger'
  isFR:                 boolean
  isDarkMode:           boolean
}

// ── Style partagé pour les boutons de contrôle ───────────────────────────────
const btnBase = {
  height: 32, borderRadius: 8, cursor: 'pointer' as const,
  border: '1.5px solid rgba(8,49,110,0.18)', background: '#fff',
  display: 'flex' as const, alignItems: 'center' as const, gap: 5,
  fontSize: 11, fontWeight: 600, color: MAP_COLORS.brand,
  fontFamily: 'DM Sans, sans-serif',
}

export function TrajetMapControls({
  autoCenter, onToggleAutoCenter, cursorMode, onToggleCursorMode,
  recalculerItineraire, isRecalculating, onGPS, role, isFR, isDarkMode,
}: TrajetMapControlsProps) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 500,
      background: isDarkMode
        ? 'linear-gradient(to top, rgba(14,27,46,0.98) 0%, rgba(14,27,46,0.94) 65%, transparent 100%)'
        : 'linear-gradient(to top, rgba(255,255,255,0.98) 0%, rgba(255,255,255,0.94) 65%, transparent 100%)',
      padding: '10px 16px 14px',
      backdropFilter: 'blur(2px)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>

          {/* Recentrer / suivi auto */}
          <button
            title={autoCenter ? (isFR ? 'Désactiver suivi auto' : 'Disable auto follow') : (isFR ? 'Recentrer sur le curseur' : 'Recenter on cursor')}
            onClick={onToggleAutoCenter}
            style={{
              width: 32, height: 32, borderRadius: 8, cursor: 'pointer',
              border: `1.5px solid ${autoCenter ? MAP_COLORS.brand : 'rgba(8,49,110,0.18)'}`,
              background: autoCenter ? 'rgba(8,49,110,0.08)' : '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
            }}
          ><FaCrosshairs size={14} color={autoCenter ? MAP_COLORS.brand : '#7a90b8'} /></button>

          {/* Bascule flèche ↔ voiture */}
          <button onClick={onToggleCursorMode} style={{ ...btnBase, padding: '0 10px' }}>
            {cursorMode === 'arrow'
              ? <><FaCar size={12} /> {isFR ? 'Voiture' : 'Car'}</>
              : <><FaArrowUp size={12} /> {isFR ? 'Flèche' : 'Arrow'}</>}
          </button>

          {/* Recalculer OSRM */}
          <button
            onClick={recalculerItineraire}
            disabled={isRecalculating}
            title={isFR ? "Recalculer l'itinéraire depuis la position actuelle" : 'Recalculate route from current position'}
            style={{
              ...btnBase, padding: '0 10px',
              background: isRecalculating ? 'rgba(8,49,110,0.05)' : '#fff',
              cursor: isRecalculating ? 'not-allowed' : 'pointer',
              color: isRecalculating ? '#7a90b8' : MAP_COLORS.brand,
            }}
          >
            {isRecalculating
              ? <><FaSyncAlt size={10} className="animate-spin" /> …</>
              : <><FaSyncAlt size={10} /> {isFR ? 'Recalculer' : 'Recalculate'}</>}
          </button>

          {/* GPS — conducteur uniquement */}
          {role === 'driver' && (
            <button
              onClick={onGPS}
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
  )
}
