// ─────────────────────────────────────────────────────────────────────────────
// map-service/index.ts
// Point d'entrée unique du MapService
// ─────────────────────────────────────────────────────────────────────────────

// ── Re-exports ────────────────────────────────────────────────────────────────
export * from './types'
export * from './constants'
export * from './markers'
export * from './popups'
export { addCampusLayer } from './layers/campus'
export { addFavoritesLayer } from './layers/favorites'
export { addOverpassLayer } from './layers/overpass'
export {
  initOffScreenButtons,
  positionOffScreenButtons,
  destroyOffScreenButtons,
} from './layers/offscreen'

// ─────────────────────────────────────────────────────────────────────────────
// CSS GLOBAL — injecté une seule fois dans la page
// Stylise les popups Leaflet pour coller au design system
// ─────────────────────────────────────────────────────────────────────────────
export const MAP_SERVICE_CSS = `
/* ── Reset popups Leaflet ── */
.ms-popup .leaflet-popup-content-wrapper {
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(8,49,110,0.15) !important;
  border: 1px solid rgba(8,49,110,0.1) !important;
  padding: 0 !important;
  overflow: hidden;
}
.ms-popup .leaflet-popup-content {
  margin: 0 !important;
}
.ms-popup .leaflet-popup-tip-container {
  display: none;
}
.ms-popup .leaflet-popup-close-button {
  top: 6px !important;
  right: 8px !important;
  color: #7a90b8 !important;
  font-size: 16px !important;
}

/* ── Zoom control ── */
.leaflet-control-zoom {
  border: none !important;
  box-shadow: 0 2px 10px rgba(8,49,110,0.12) !important;
}
.leaflet-control-zoom a {
  border-radius: 8px !important;
  font-weight: 700 !important;
  color: #08316e !important;
  border-color: rgba(8,49,110,0.12) !important;
  font-size: 16px !important;
  width: 30px !important;
  height: 30px !important;
  line-height: 30px !important;
}
.leaflet-control-zoom a:hover {
  background: rgba(8,49,110,0.07) !important;
}

/* ── Attribution ── */
.leaflet-control-attribution {
  font-size: 9px !important;
  background: rgba(255,255,255,0.85) !important;
  backdrop-filter: blur(4px) !important;
  border-radius: 4px 0 0 0 !important;
  padding: 2px 6px !important;
}
.leaflet-control-attribution a {
  color: #7a90b8 !important;
}

/* ── Marqueurs — supprime le background natif Leaflet ── */
.leaflet-marker-icon {
  background: transparent !important;
  border: none !important;
}

/* ── Container ── */
.leaflet-container {
  font-family: 'DM Sans', sans-serif !important;
}

/* ── Tooltips hover ── */
.ms-tooltip {
  background: rgba(255,255,255,0.97) !important;
  border: 1px solid rgba(8,49,110,0.12) !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 10px rgba(8,49,110,0.13) !important;
  padding: 4px 8px !important;
  font-family: 'DM Sans', sans-serif !important;
}
.ms-tooltip::before {
  border-top-color: rgba(255,255,255,0.97) !important;
}

/* ── Mode sombre (19h–6h) — inversion des tuiles ── */
.ms-dark .leaflet-tile-pane {
  filter: invert(1) hue-rotate(180deg) brightness(1.35) contrast(0.92) saturate(1.15);
}
.ms-dark .leaflet-control-zoom a {
  background: #1a2a44 !important;
  color: #c8d6ea !important;
  border-color: rgba(200,214,234,0.18) !important;
}
.ms-dark .leaflet-control-zoom a:hover {
  background: #223556 !important;
}
.ms-dark .leaflet-control-attribution {
  background: rgba(18,32,56,0.85) !important;
  color: #7a90b8 !important;
}
`

// ─────────────────────────────────────────────────────────────────────────────
// injectMapServiceCSS()
// Appeler une fois dans le composant racine de la carte ou dans _app.tsx
// ─────────────────────────────────────────────────────────────────────────────
let _cssInjected = false
export function injectMapServiceCSS(): void {
  if (_cssInjected || typeof document === 'undefined') return
  const style = document.createElement('style')
  style.setAttribute('data-map-service', 'true')
  style.textContent = MAP_SERVICE_CSS
  document.head.appendChild(style)
  _cssInjected = true
}
