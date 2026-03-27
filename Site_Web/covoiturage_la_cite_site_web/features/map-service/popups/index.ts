// ─────────────────────────────────────────────────────────────────────────────
// map-service/popups/index.ts
// Templates HTML pour les popups Leaflet — cohérents avec le design system
// ─────────────────────────────────────────────────────────────────────────────
import type { ZoneCampus } from '../types'
import { MAP_COLORS } from '../constants'

// Styles réutilisables pour les popups
const S = {
  wrap:    `font-family:'DM Sans',sans-serif;padding:10px 13px;min-width:160px`,
  title:   `font-family:'Syne',sans-serif;font-weight:800;font-size:13px;color:${MAP_COLORS.brand};margin-bottom:3px`,
  sub:     `font-size:10px;color:${MAP_COLORS.brand};opacity:0.6;line-height:1.5`,
  badge:   `display:inline-block;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;margin-top:5px`,
  badgeGn: `background:rgba(10,173,106,0.12);color:#0a7a4c`,
  badgeRd: `background:rgba(224,48,80,0.1);color:#9a2030`,
  badgeBl: `background:rgba(8,49,110,0.1);color:${MAP_COLORS.brand}`,
  divider: `height:1px;background:rgba(8,49,110,0.07);margin:7px 0`,
  row:     `display:flex;justify-content:space-between;font-size:10px;margin-bottom:3px`,
  key:     `color:#7a90b8`,
  val:     `font-weight:600;color:#0d1f3c`,
}

/** Popup conducteur — affiché sur le curseur de position */
export function conducteurPopup(opts: {
  prenom: string
  nom: string
  initiales: string
  note: number
  nbTrajets: number
  vehicule: string
  eta?: string
  couleur?: string
}): string {
  const stars = '★'.repeat(Math.floor(opts.note)) + '☆'.repeat(5 - Math.floor(opts.note))
  const avatarBg = opts.couleur ?? MAP_COLORS.brand
  return `
<div style="${S.wrap}">
  <div style="display:flex;align-items:center;gap:9px;margin-bottom:8px">
    <div style="width:34px;height:34px;border-radius:50%;background:${avatarBg};display:flex;align-items:center;
                justify-content:center;font-family:Syne,sans-serif;font-weight:800;font-size:13px;
                color:white;flex-shrink:0">${opts.initiales}</div>
    <div>
      <div style="${S.title}">${opts.prenom} ${opts.nom}</div>
      <div style="font-size:11px;color:#c8960a;letter-spacing:.5px">${stars} <span style="color:#7a90b8;font-size:10px">${opts.note}/5</span></div>
    </div>
  </div>
  <div style="${S.divider}"></div>
  <div style="${S.row}"><span style="${S.key}">Véhicule</span><span style="${S.val}">${opts.vehicule}</span></div>
  <div style="${S.row}"><span style="${S.key}">Trajets</span><span style="${S.val}">${opts.nbTrajets}</span></div>
  ${opts.eta ? `<div style="${S.row}"><span style="${S.key}">ETA</span><span style="${S.val};color:${MAP_COLORS.depart}">${opts.eta}</span></div>` : ''}
  <span style="${S.badge} ${S.badgeBl}">✓ Profil vérifié</span>
</div>`.trim()
}

/** Popup point de rencontre campus */
export function rencontrePopup(zone: ZoneCampus): string {
  return `
<div style="${S.wrap}">
  <div style="${S.title}">${zone.icone} ${zone.nom}</div>
  <div style="${S.sub}">${zone.instructions}</div>
  ${zone.capacite ? `
  <div style="${S.divider}"></div>
  <div style="${S.row}"><span style="${S.key}">Capacité</span><span style="${S.val}">${zone.capacite} véhicules</span></div>` : ''}
  <span style="${S.badge} ${S.badgeBl}">📍 Campus La Cité</span>
</div>`.trim()
}

/** Popup résultat trajet (carte de recherche) */
export function trajetPopup(opts: {
  depart: string
  arrivee: string
  prix: number
  places: number
  heure: string
}): string {
  return `
<div style="${S.wrap}">
  <div style="${S.title}">🚗 ${opts.depart} → ${opts.arrivee}</div>
  <div style="${S.divider}"></div>
  <div style="${S.row}"><span style="${S.key}">Prix</span><span style="${S.val};color:${MAP_COLORS.depart}">+${opts.prix} $</span></div>
  <div style="${S.row}"><span style="${S.key}">Places</span><span style="${S.val}">${opts.places} dispo</span></div>
  <div style="${S.row}"><span style="${S.key}">Départ</span><span style="${S.val}">${opts.heure}</span></div>
</div>`.trim()
}

/** Popup arrêt de bus OC Transpo */
export function busStopPopup(nom: string, lignes?: string): string {
  return `
<div style="${S.wrap}">
  <div style="${S.title}">🚌 ${nom || 'Arrêt OC Transpo'}</div>
  ${lignes ? `<div style="${S.sub}">Lignes : <strong>${lignes}</strong></div>` : ''}
  <span style="${S.badge} ${S.badgeBl}">OC Transpo</span>
</div>`.trim()
}

/** Popup station-service */
export function gasStationPopup(nom: string): string {
  return `
<div style="${S.wrap}">
  <div style="${S.title}">⛽ ${nom || 'Station-service'}</div>
  <span style="${S.badge}" style="background:rgba(212,96,10,0.1);color:#8a3000">Carburant</span>
</div>`.trim()
}

/** Popup bâtiment public */
export function publicServicePopup(type: string, nom?: string): string {
  const typeLabel: Record<string, string> = {
    school:           'École',
    college:          'Collège',
    university:       'Université',
    hospital:         'Hôpital',
    clinic:           'Clinique',
    library:          'Bibliothèque',
    townhall:         'Hôtel de ville',
    police:           'Police',
    fire_station:     'Caserne',
    community_centre: 'Centre communautaire',
    courthouse:       'Palais de justice',
    public_building:  'Bâtiment public',
  }
  const label = typeLabel[type] ?? 'Bâtiment public'
  return `
<div style="${S.wrap}">
  <div style="${S.title}">${label}</div>
  ${nom ? `<div style="${S.sub}">${nom}</div>` : ''}
  <span style="${S.badge} ${S.badgeBl}">Service public</span>
</div>`.trim()
}
