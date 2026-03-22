// ─────────────────────────────────────────────────────────────────────────────
// map-service/layers/index.ts
// Couches additionnelles : campus, Overpass, boutons off-screen
// ─────────────────────────────────────────────────────────────────────────────

// ── Re-exports depuis les sous-modules ───────────────────────────────────────
export { addCampusLayer } from './campus'
export { addOverpassLayer } from './overpass'
export {
  initOffScreenButtons,
  positionOffScreenButtons,
  destroyOffScreenButtons,
} from './offscreen'
