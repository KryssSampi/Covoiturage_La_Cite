// ─────────────────────────────────────────────────────────────────────────────
// map-service/layers/offscreen.ts
// Boutons directionnels pour POIs hors du viewport
// ─────────────────────────────────────────────────────────────────────────────
import type { OffScreenTarget } from '../types'
import { MAP_COLORS as MC } from '../constants'

interface ButtonState {
  target: OffScreenTarget
  el: HTMLButtonElement
}

let _buttons: ButtonState[] = []
let _container: HTMLDivElement | null = null
let _mapEl: HTMLElement | null = null

/**
 * Initialise la couche off-screen sur un conteneur carte.
 * Crée des boutons directionnels sur les bords quand un POI sort du viewport.
 */
export function initOffScreenButtons(
  mapEl: HTMLElement,
  mapInstance: import('leaflet').Map,
  targets: OffScreenTarget[],
  onClickTarget: (target: OffScreenTarget) => void,
) {
  destroyOffScreenButtons()

  _mapEl = mapEl

  // Conteneur absolu recouvrant la carte
  _container = document.createElement('div')
  Object.assign(_container.style, {
    position:      'absolute',
    inset:         '0',
    pointerEvents: 'none',
    zIndex:        '450',
  })
  mapEl.style.position = 'relative'
  mapEl.appendChild(_container)

  // Crée un bouton par cible
  for (const target of targets) {
    const btn = document.createElement('button')
    btn.style.cssText = `
      position:absolute;
      pointer-events:all;
      display:none;
      align-items:center;
      gap:5px;
      padding:5px 10px 5px 8px;
      background:${MC.offScreenBg};
      border:1.5px solid ${target.color ?? MC.offScreenBorder};
      border-radius:20px;
      box-shadow:0 2px 10px rgba(8,49,110,0.15);
      cursor:pointer;
      font-family:'DM Sans',sans-serif;
      font-size:11px;
      font-weight:700;
      color:${target.color ?? MC.brand};
      white-space:nowrap;
      transition:opacity .2s;
    `
    btn.innerHTML = `
      <span style="font-size:13px">${target.icone}</span>
      <span>${target.label}</span>
      <span style="font-size:9px;opacity:0.6">↗</span>
    `
    btn.addEventListener('click', () => {
      onClickTarget(target)
      mapInstance.flyTo(
        [target.coordonnees.lat, target.coordonnees.lng],
        15,
        { animate: true, duration: 1.2 },
      )
    })
    _container.appendChild(btn)
    _buttons.push({ target, el: btn })
  }

  // Met à jour la position à chaque mouvement de carte
  const updateButtons = () => positionOffScreenButtons(mapInstance)
  mapInstance.on('move', updateButtons)
  mapInstance.on('zoom', updateButtons)
  updateButtons()
}

/**
 * Calcule et repositionne les boutons.
 * POI dans le viewport → bouton masqué. Sinon → positionné sur le bord.
 */
export function positionOffScreenButtons(mapInstance: import('leaflet').Map) {
  if (!_container || !_mapEl) return

  const W = _mapEl.offsetWidth
  const H = _mapEl.offsetHeight
  const PAD = 56

  for (const { target, el } of _buttons) {
    const pt = mapInstance.latLngToContainerPoint([
      target.coordonnees.lat,
      target.coordonnees.lng,
    ])

    const inView = pt.x >= 0 && pt.x <= W && pt.y >= 0 && pt.y <= H
    if (inView) {
      el.style.display = 'none'
      continue
    }

    // Angle centre carte → POI
    const cx = W / 2
    const cy = H / 2
    const angle = Math.atan2(pt.y - cy, pt.x - cx)

    const cosA = Math.cos(angle)
    const sinA = Math.sin(angle)
    const tX   = cosA !== 0 ? (W / 2 - PAD) / Math.abs(cosA) : Infinity
    const tY   = sinA !== 0 ? (H / 2 - PAD) / Math.abs(sinA) : Infinity
    const t    = Math.min(tX, tY)

    const bx = cx + cosA * t
    const by = cy + sinA * t

    const bw = el.offsetWidth  || 120
    const bh = el.offsetHeight ||  32

    el.style.display = 'flex'
    el.style.left    = `${Math.max(8, Math.min(W - bw - 8, bx - bw / 2))}px`
    el.style.top     = `${Math.max(8, Math.min(H - bh - 8, by - bh / 2))}px`
  }
}

/** Détruit tous les boutons off-screen */
export function destroyOffScreenButtons() {
  _container?.remove()
  _container = null
  _buttons   = []
  _mapEl     = null
}
