// ─────────────────────────────────────────────────────────────────────────────
// map-service/index.ts  — copie verbatim du site web
// ─────────────────────────────────────────────────────────────────────────────
export * from './types'
export * from './constants'
export * from './markers'
export * from './popups'
export { addCampusLayer }    from './layers/campus'
export { addFavoritesLayer } from './layers/favorites'
export { addOverpassLayer }  from './layers/overpass'
export { initOffScreenButtons, positionOffScreenButtons, destroyOffScreenButtons } from './layers/offscreen'

export const MAP_SERVICE_CSS = `
.ms-popup .leaflet-popup-content-wrapper {
  border-radius: 12px !important;
  box-shadow: 0 4px 20px rgba(8,49,110,0.15) !important;
  border: 1px solid rgba(8,49,110,0.1) !important;
  padding: 0 !important;
  overflow: hidden;
}
.ms-popup .leaflet-popup-content { margin: 0 !important; }
.ms-popup .leaflet-popup-tip-container { display: none; }
.ms-popup .leaflet-popup-close-button {
  top: 6px !important; right: 8px !important;
  color: #7a90b8 !important; font-size: 16px !important;
}
.leaflet-control-zoom {
  border: none !important;
  box-shadow: 0 2px 10px rgba(8,49,110,0.12) !important;
}
.leaflet-control-zoom a {
  border-radius: 8px !important; font-weight: 700 !important;
  color: #08316e !important; border-color: rgba(8,49,110,0.12) !important;
  font-size: 16px !important; width: 30px !important;
  height: 30px !important; line-height: 30px !important;
}
.leaflet-control-zoom a:hover { background: rgba(8,49,110,0.07) !important; }
.leaflet-control-attribution {
  font-size: 9px !important;
  background: rgba(255,255,255,0.85) !important;
  backdrop-filter: blur(4px) !important;
  border-radius: 4px 0 0 0 !important;
  padding: 2px 6px !important;
}
.leaflet-control-attribution a { color: #7a90b8 !important; }
.leaflet-marker-icon { background: transparent !important; border: none !important; }
.leaflet-container { font-family: 'DM Sans', sans-serif !important; }
.ms-tooltip {
  background: rgba(255,255,255,0.97) !important;
  border: 1px solid rgba(8,49,110,0.12) !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 10px rgba(8,49,110,0.13) !important;
  padding: 4px 8px !important;
  font-family: 'DM Sans', sans-serif !important;
}
.ms-tooltip::before { border-top-color: rgba(255,255,255,0.97) !important; }
.ms-dark .leaflet-tile-pane {
  filter: invert(1) hue-rotate(180deg) brightness(1.35) contrast(0.92) saturate(1.15);
}
`

let _cssInjected = false
export function injectMapServiceCSS(): void {
  if (_cssInjected || typeof document === 'undefined') return
  const style = document.createElement('style')
  style.setAttribute('data-map-service', 'true')
  style.textContent = MAP_SERVICE_CSS
  document.head.appendChild(style)
  _cssInjected = true
}
