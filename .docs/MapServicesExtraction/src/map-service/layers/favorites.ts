// ─────────────────────────────────────────────────────────────────────────────
// map-service/layers/favorites.ts  — adapté : LieuFavoriUnifie local (pas @/shared)
// ─────────────────────────────────────────────────────────────────────────────
import type { LieuFavoriUnifie } from '@/types'
import { MAP_COLORS } from '../constants'
import { createFavoriIcon } from '../markers'

type LMap = import('leaflet').Map
type L    = typeof import('leaflet')

const FAVORI_COLORS: Record<string, string> = {
  campus:   MAP_COLORS.brand,
  domicile: MAP_COLORS.depart,
  travail:  MAP_COLORS.passager,
  ville:    MAP_COLORS.rencontre,
  autre:    MAP_COLORS.routeAlt,
  ecole:    MAP_COLORS.brand,
}

const FAVORI_DESC_FR: Record<string, string> = {
  campus:   'Collège La Cité — Campus principal',
  domicile: 'Mon domicile',
  travail:  'Lieu de travail',
}

export async function addFavoritesLayer(
  map: LMap,
  Leaflet: L,
  favorites: LieuFavoriUnifie[],
  opts?: { isFR?: boolean; showAnchored?: boolean },
) {
  const isFR         = opts?.isFR         ?? true
  const showAnchored = opts?.showAnchored  ?? true
  const markers: import('leaflet').Marker[] = []

  for (const fav of favorites) {
    if (!showAnchored && fav.isAnchored) continue
    const color = FAVORI_COLORS[fav.iconTag] ?? MAP_COLORS.brand
    const icon  = await createFavoriIcon(fav.pseudonyme, color, fav.iconTag)
    const desc  = (isFR ? FAVORI_DESC_FR : {})[fav.iconTag] ?? ''
    const marker = Leaflet.marker(
      [fav.coordonnees.lat, fav.coordonnees.lng],
      { icon, zIndexOffset: 200 },
    )
      .addTo(map)
      .bindTooltip(
        `<div style="font-family:'DM Sans',sans-serif;text-align:center">
           <div style="font-weight:700;font-size:11px;color:${color}">${fav.pseudonyme}</div>
           ${desc ? `<div style="font-size:9px;color:#7a90b8;margin-top:1px">${desc}</div>` : ''}
         </div>`,
        { direction: 'top', offset: [0, -38], className: 'ms-tooltip' },
      )
      .bindPopup(
        `<div style="padding:9px 12px;font-family:'DM Sans',sans-serif">
           <div style="font-family:'Syne',sans-serif;font-weight:800;font-size:12px;color:${color}">${fav.pseudonyme}</div>
           <div style="font-size:10px;color:#7a90b8;margin-top:2px">${fav.adresse}</div>
         </div>`,
        { className: 'ms-popup' },
      )

    markers.push(marker)
  }

  return { markers, cleanup: () => markers.forEach((m) => m.remove()) }
}
