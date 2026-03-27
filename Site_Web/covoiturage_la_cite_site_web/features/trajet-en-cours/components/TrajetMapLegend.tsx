// ─────────────────────────────────────────────────────────────────────────────
// features/trajet-en-cours/components/TrajetMapLegend.tsx
// Panneau légende de la carte (couleurs polylines, marqueurs, couches)
// ─────────────────────────────────────────────────────────────────────────────
import { FaFlagCheckered, FaBus, FaGasPump, FaMapMarkerAlt, FaGraduationCap, FaList } from 'react-icons/fa'
import { MAP_COLORS } from '@/features/map-service'

interface TrajetMapLegendProps {
  show:          boolean
  onToggle:      () => void
  isDarkMode:    boolean
  isFR:          boolean
  labelDepart:   string
  labelArrivee:  string
}

// ── Composant Légende ────────────────────────────────────────────────────────
export function TrajetMapLegend({ show, onToggle, isDarkMode, isFR, labelDepart, labelArrivee }: TrajetMapLegendProps) {
  if (!show) {
    return (
      <button
        onClick={onToggle}
        style={{
          position: 'absolute', bottom: 88, left: 14, zIndex: 500,
          background: isDarkMode ? 'rgba(14,27,46,0.97)' : 'rgba(255,255,255,0.97)',
          border: `1px solid ${isDarkMode ? 'rgba(200,214,234,0.15)' : 'rgba(8,49,110,0.15)'}`,
          borderRadius: 8, padding: '5px 10px', fontSize: 10, fontWeight: 600,
          color: isDarkMode ? '#90b8e8' : MAP_COLORS.brand, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 4,
        }}
      ><FaList size={9} /> {isFR ? 'Légende' : 'Legend'}</button>
    )
  }

  // Entrées de la légende
  const items = [
    { el: <div style={{ width: 10, height: 10, borderRadius: '50%', background: MAP_COLORS.depart, border: '2px solid white', boxShadow: `0 0 0 1.5px ${MAP_COLORS.depart}`, flexShrink: 0 }} />, lbl: labelDepart },
    { el: <div style={{ width: 20, height: 3, background: MAP_COLORS.routeDone, borderRadius: 2, flexShrink: 0 }} />, lbl: isFR ? 'Tronçon parcouru' : 'Completed section' },
    { el: <div style={{ width: 20, height: 3, background: MAP_COLORS.routeRemain, borderRadius: 2, flexShrink: 0, opacity: .75 }} />, lbl: isFR ? 'Tronçon restant' : 'Remaining section' },
    { el: <FaFlagCheckered size={10} color={MAP_COLORS.arrivee} style={{ flexShrink: 0 }} />, lbl: labelArrivee },
    { el: <FaBus size={10} color={MAP_COLORS.busStop} style={{ flexShrink: 0 }} />, lbl: isFR ? 'Arrêts OC Transpo' : 'OC Transpo stops' },
    { el: <FaGasPump size={10} color={MAP_COLORS.gasStation} style={{ flexShrink: 0 }} />, lbl: isFR ? 'Stations-service' : 'Gas stations' },
    { el: <FaMapMarkerAlt size={10} color={MAP_COLORS.campusZone} style={{ flexShrink: 0 }} />, lbl: isFR ? 'Zones campus' : 'Campus zones' },
    { el: <FaGraduationCap size={10} color={MAP_COLORS.brand} style={{ flexShrink: 0 }} />, lbl: isFR ? 'Favoris' : 'Favourites' },
  ]

  return (
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
      {items.map((r, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
          {r.el}
          <span style={{ fontSize: 10, color: isDarkMode ? '#b0c4e0' : '#0d1f3c', whiteSpace: 'nowrap' }}>{r.lbl}</span>
        </div>
      ))}
      <button
        onClick={onToggle}
        style={{
          marginTop: 5, fontSize: 9, color: '#7a90b8', background: 'none', border: 'none',
          cursor: 'pointer', padding: 0, textDecoration: 'underline', pointerEvents: 'all',
        }}
      >
        {isFR ? 'Masquer' : 'Hide'}
      </button>
    </div>
  )
}
