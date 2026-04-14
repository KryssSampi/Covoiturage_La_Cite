// ─────────────────────────────────────────────────────────────────────────────
// map-service/markers/index.ts  — copie verbatim du site web
// ─────────────────────────────────────────────────────────────────────────────
import type { CursorMode, MarkerStatus, ZoneCampus } from '../types'
import { MAP_COLORS } from '../constants'
import { FaHome, FaSchool, FaStar, FaBus, FaLandmark, FaHospital, FaBook, FaGavel, FaFireExtinguisher, FaUsers, FaBuilding, FaBalanceScale, FaShieldAlt } from 'react-icons/fa'
import { renderToStaticMarkup } from 'react-dom/server'

type LeafletType = typeof import('leaflet')
let _L: LeafletType | null = null
async function getL(): Promise<LeafletType> {
  if (!_L) _L = await import('leaflet')
  return _L
}

export async function createDivIcon(
  html: string,
  size: [number, number],
  anchor: [number, number],
  popupAnchor?: [number, number],
) {
  const L = await getL()
  return L.divIcon({
    className: '',
    html,
    iconSize:    size,
    iconAnchor:  anchor,
    popupAnchor: popupAnchor ?? [0, -anchor[1]],
  })
}

export function arrowSVG(heading: number, status: MarkerStatus = 'normal'): string {
  const color  = status === 'urgence' ? MAP_COLORS.urgence : MAP_COLORS.brand
  const accent = status === 'urgence' ? '#c01838' : MAP_COLORS.brandLight
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
  <defs>
    <filter id="ms-shadow-a" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.22)"/>
    </filter>
  </defs>
  <g transform="rotate(${heading},22,22)" filter="url(#ms-shadow-a)">
    <circle cx="22" cy="22" r="19" fill="white" stroke="rgba(8,49,110,0.12)" stroke-width="1.5"/>
    <path d="M22 5 L31 36 L22 30 L13 36 Z" fill="${color}"/>
    <path d="M22 5 L27 22 L22 30 L22 5" fill="${accent}" opacity="0.2"/>
    <circle cx="22" cy="22" r="3.5" fill="white"/>
  </g>
</svg>`.trim()
}

export function carSVG(heading: number, status: MarkerStatus = 'normal'): string {
  const body = status === 'urgence' ? MAP_COLORS.urgence : MAP_COLORS.brand
  const roof = status === 'urgence' ? '#c01838' : MAP_COLORS.brandLight
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
  <defs>
    <filter id="ms-shadow-c" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.22)"/>
    </filter>
  </defs>
  <g transform="rotate(${heading - 90},22,22)" filter="url(#ms-shadow-c)">
    <circle cx="22" cy="22" r="19" fill="white" stroke="rgba(8,49,110,0.12)" stroke-width="1.5"/>
    <rect x="10" y="16" width="24" height="13" rx="3.5" fill="${body}"/>
    <path d="M14 16 Q14 9 22 9 Q30 9 30 16Z" fill="${roof}"/>
    <rect x="15" y="11.5" width="6" height="4.5" rx="1.5" fill="#cce4f8" opacity="0.9"/>
    <rect x="23" y="11.5" width="6" height="4.5" rx="1.5" fill="#cce4f8" opacity="0.9"/>
    <circle cx="15" cy="29.5" r="3.5" fill="#1a2a40"/>
    <circle cx="29" cy="29.5" r="3.5" fill="#1a2a40"/>
    <circle cx="15" cy="29.5" r="1.5" fill="#7a90b8"/>
    <circle cx="29" cy="29.5" r="1.5" fill="#7a90b8"/>
    <rect x="10" y="19" width="3.5" height="2.5" rx="1" fill="#fde68a"/>
    <rect x="30.5" y="19" width="3.5" height="2.5" rx="1" fill="#f87171"/>
  </g>
</svg>`.trim()
}

export async function createCursorIcon(
  heading: number,
  mode: CursorMode = 'arrow',
  status: MarkerStatus = 'normal',
) {
  const html = mode === 'arrow' ? arrowSVG(heading, status) : carSVG(heading, status)
  return createDivIcon(html, [44, 44], [22, 22], [0, -22])
}

export function departSVG(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
  <defs>
    <filter id="ms-dep" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="rgba(0,0,0,0.22)"/>
    </filter>
  </defs>
  <circle cx="11" cy="11" r="9.5" fill="${MAP_COLORS.depart}" stroke="white"
          stroke-width="2.5" filter="url(#ms-dep)"/>
  <circle cx="11" cy="11" r="4" fill="white"/>
</svg>`.trim()
}

export async function createDepartIcon() {
  return createDivIcon(departSVG(), [22, 22], [11, 11], [0, -11])
}

export function arriveeSVG(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="46" viewBox="0 0 32 46">
  <defs>
    <filter id="ms-arr" x="-30%" y="-20%" width="160%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.25)"/>
    </filter>
    <pattern id="checker" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
      <rect x="0" y="0" width="3" height="3" fill="${MAP_COLORS.arrivee}"/>
      <rect x="3" y="3" width="3" height="3" fill="${MAP_COLORS.arrivee}"/>
      <rect x="3" y="0" width="3" height="3" fill="white"/>
      <rect x="0" y="3" width="3" height="3" fill="white"/>
    </pattern>
  </defs>
  <line x1="6" y1="6" x2="6" y2="44" stroke="${MAP_COLORS.arrivee}" stroke-width="2.5"
        stroke-linecap="round" filter="url(#ms-arr)"/>
  <path d="M6 6 L30 12 L6 20 Z" fill="url(#checker)" filter="url(#ms-arr)"/>
  <path d="M6 6 L30 12 L6 20 Z" fill="none" stroke="${MAP_COLORS.arrivee}" stroke-width="0.8" opacity="0.4"/>
  <circle cx="6" cy="44" r="2.5" fill="${MAP_COLORS.arrivee}"/>
</svg>`.trim()
}

export async function createArriveeIcon() {
  return createDivIcon(arriveeSVG(), [32, 46], [6, 44], [14, -44])
}

function getCampusIconSVG(type: string): string {
  switch (type) {
    case 'maison':  return renderToStaticMarkup(FaHome({ color: '#0aad6a', size: 20 }))
    case 'ecole':   return renderToStaticMarkup(FaSchool({ color: '#08316e', size: 20 }))
    case 'star':    return renderToStaticMarkup(FaStar({ color: '#fbbf24', size: 20 }))
    case 'bus':     return renderToStaticMarkup(FaBus({ color: '#e11d48', size: 20 }))
    case 'autre':   return renderToStaticMarkup(FaLandmark({ color: '#2563eb', size: 20 }))
    default:        return renderToStaticMarkup(FaStar({ color: '#fbbf24', size: 20 }))
  }
}

export function rencontreSVG(zone: ZoneCampus, selected = false): string {
  const bg     = selected ? MAP_COLORS.rencontre : 'white'
  const border = MAP_COLORS.rencontre
  const iconSVG = getCampusIconSVG(zone.icone)
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
  <defs>
    <filter id="ms-ren" x="-30%" y="-20%" width="160%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,152,200,0.3)"/>
    </filter>
  </defs>
  <path d="M18 2 C9.2 2 2 9.2 2 18 C2 28.8 18 42 18 42 C18 42 34 28.8 34 18 C34 9.2 26.8 2 18 2Z"
        fill="${bg}" stroke="${border}" stroke-width="2" filter="url(#ms-ren)"/>
  <circle cx="18" cy="18" r="10" fill="${selected ? 'rgba(255,255,255,0.2)' : MAP_COLORS.rencontre + '15'}"
          stroke="${border}" stroke-width="1.5"/>
  <g transform="translate(8,8)">${iconSVG}</g>
</svg>`.trim()
}

export async function createRencontreIcon(zone: ZoneCampus, selected = false) {
  return createDivIcon(rencontreSVG(zone, selected), [36, 44], [18, 42], [0, -42])
}

export function passagerSVG(initiales: string, couleur: string, status: MarkerStatus = 'normal'): string {
  const pulse = status === 'pulse'
    ? `<circle cx="20" cy="20" r="22" fill="${couleur}" opacity="0.15">
         <animate attributeName="r" values="18;24;18" dur="1.8s" repeatCount="indefinite"/>
         <animate attributeName="opacity" values="0.15;0.03;0.15" dur="1.8s" repeatCount="indefinite"/>
       </circle>`
    : ''
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <defs>
    <filter id="ms-pas" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="rgba(0,0,0,0.2)"/>
    </filter>
  </defs>
  ${pulse}
  <circle cx="20" cy="20" r="17" fill="${couleur}" stroke="white"
          stroke-width="2.5" filter="url(#ms-pas)"/>
  <text x="20" y="25" text-anchor="middle" font-family="Syne,sans-serif"
        font-weight="800" font-size="12" fill="white">${initiales}</text>
</svg>`.trim()
}

export async function createPassagerIcon(
  initiales: string,
  couleur: string,
  status: MarkerStatus = 'normal',
) {
  return createDivIcon(passagerSVG(initiales, couleur, status), [40, 40], [20, 20], [0, -20])
}

export function busStopSVG(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26">
  <circle cx="13" cy="13" r="11.5" fill="${MAP_COLORS.busStopBg}" stroke="${MAP_COLORS.busStop}" stroke-width="1.5"/>
  <rect x="7" y="8" width="12" height="8" rx="2" fill="${MAP_COLORS.busStop}"/>
  <rect x="8.5" y="9.5" width="3.5" height="3" rx="0.8" fill="white" opacity="0.9"/>
  <rect x="14" y="9.5" width="3.5" height="3" rx="0.8" fill="white" opacity="0.9"/>
  <line x1="7" y1="18" x2="19" y2="18" stroke="${MAP_COLORS.busStop}" stroke-width="1.5"/>
  <circle cx="9.5" cy="19.5" r="1.8" fill="${MAP_COLORS.busStop}"/>
  <circle cx="16.5" cy="19.5" r="1.8" fill="${MAP_COLORS.busStop}"/>
</svg>`.trim()
}

export async function createBusStopIcon() {
  return createDivIcon(busStopSVG(), [26, 26], [13, 13], [0, -13])
}

export function gasStationSVG(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="10.5" fill="${MAP_COLORS.gasStationBg}" stroke="${MAP_COLORS.gasStation}" stroke-width="1.5"/>
  <rect x="6" y="8" width="8" height="9" rx="1.5" fill="${MAP_COLORS.gasStation}"/>
  <rect x="15" y="10" width="2" height="5" rx="0.5" fill="${MAP_COLORS.gasStation}"/>
  <path d="M17 10 V8.5 Q17 7 15.5 7" stroke="${MAP_COLORS.gasStation}" stroke-width="1.3" fill="none" stroke-linecap="round"/>
  <rect x="7.5" y="9.5" width="5" height="3" rx="0.8" fill="white" opacity="0.85"/>
</svg>`.trim()
}

export async function createGasStationIcon() {
  return createDivIcon(gasStationSVG(), [24, 24], [12, 12], [0, -12])
}

export function domicileSVG(): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
  <defs>
    <filter id="ms-hom" x="-30%" y="-20%" width="160%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(10,173,106,0.3)"/>
    </filter>
  </defs>
  <path d="M18 2 C9.2 2 2 9.2 2 18 C2 28.8 18 42 18 42 C18 42 34 28.8 34 18 C34 9.2 26.8 2 18 2Z"
        fill="${MAP_COLORS.depart}" stroke="white" stroke-width="2" filter="url(#ms-hom)"/>
  <circle cx="18" cy="18" r="10" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" stroke-width="1"/>
  <path d="M18 11 L11 17 L11 24 L15 24 L15 20 L21 20 L21 24 L25 24 L25 17Z" fill="white"/>
  <path d="M9 17 L18 9 L27 17" stroke="white" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`.trim()
}

export async function createDomicileIcon() {
  return createDivIcon(domicileSVG(), [36, 44], [18, 42], [0, -42])
}

export function clusterSVG(count: number): string {
  const size = count > 9 ? 38 : 32
  const r    = size / 2
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <circle cx="${r}" cy="${r}" r="${r - 1}" fill="${MAP_COLORS.brand}" stroke="white" stroke-width="2.5" opacity="0.9"/>
  <circle cx="${r}" cy="${r}" r="${r - 5}" fill="white" opacity="0.15"/>
  <text x="${r}" y="${r + 4.5}" text-anchor="middle" font-family="Syne,sans-serif"
        font-weight="800" font-size="${count > 9 ? 12 : 13}" fill="white">${count}</text>
</svg>`.trim()
}

export async function createClusterIcon(count: number) {
  const size = count > 9 ? 38 : 32
  return createDivIcon(clusterSVG(count), [size, size], [size / 2, size / 2])
}

function getFavoriIconSVG(type?: string): string {
  switch (type) {
    case 'domicile': return renderToStaticMarkup(FaHome({ color: '#0aad6a', size: 18 }))
    case 'campus':   return renderToStaticMarkup(FaSchool({ color: '#08316e', size: 18 }))
    case 'travail':  return renderToStaticMarkup(FaLandmark({ color: '#2563eb', size: 18 }))
    case 'autre':    return renderToStaticMarkup(FaStar({ color: '#fbbf24', size: 18 }))
    default:         return renderToStaticMarkup(FaStar({ color: '#fbbf24', size: 18 }))
  }
}

export function favoriSVG(label: string, color: string, iconTag?: string): string {
  const iconSVG = getFavoriIconSVG(iconTag)
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
  <defs>
    <filter id="ms-fav" x="-30%" y="-20%" width="160%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="rgba(0,0,0,0.22)"/>
    </filter>
  </defs>
  <path d="M15 2 C8 2 2 8 2 15 C2 24 15 36 15 36 C15 36 28 24 28 15 C28 8 22 2 15 2Z"
        fill="${color}" stroke="white" stroke-width="1.5" filter="url(#ms-fav)"/>
  <circle cx="15" cy="14" r="7" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
  <g transform="translate(7,7)">${iconSVG}</g>
</svg>`.trim()
}

export function domicileFavoriSVG(color: string): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
  <defs>
    <filter id="ms-fav-h" x="-30%" y="-20%" width="160%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="rgba(0,0,0,0.22)"/>
    </filter>
  </defs>
  <path d="M15 2 C8 2 2 8 2 15 C2 24 15 36 15 36 C15 36 28 24 28 15 C28 8 22 2 15 2Z"
        fill="${color}" stroke="white" stroke-width="1.5" filter="url(#ms-fav-h)"/>
  <circle cx="15" cy="14" r="7" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
  <path d="M15 8 L9 13 L9 19 L12 19 L12 16 L18 16 L18 19 L21 19 L21 13Z" fill="white"/>
  <path d="M8 13 L15 7 L22 13" stroke="white" stroke-width="1.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`.trim()
}

export function campusFavoriSVG(color: string): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="30" height="38" viewBox="0 0 30 38">
  <defs>
    <filter id="ms-fav-c" x="-30%" y="-20%" width="160%" height="140%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="rgba(0,0,0,0.22)"/>
    </filter>
  </defs>
  <path d="M15 2 C8 2 2 8 2 15 C2 24 15 36 15 36 C15 36 28 24 28 15 C28 8 22 2 15 2Z"
        fill="${color}" stroke="white" stroke-width="1.5" filter="url(#ms-fav-c)"/>
  <circle cx="15" cy="14" r="7" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
  <polygon points="15,8 8,12 15,16 22,12" fill="white"/>
  <path d="M10,13 L10,17 Q15,20 20,17 L20,13" fill="none" stroke="white" stroke-width="1"/>
  <line x1="22" y1="12" x2="22" y2="18" stroke="white" stroke-width="1"/>
</svg>`.trim()
}

export async function createFavoriIcon(label: string, color: string = MAP_COLORS.brand, iconTag?: string) {
  let html: string
  if (iconTag === 'campus' || iconTag === 'ecole') {
    html = campusFavoriSVG(color)
  } else if (iconTag === 'domicile') {
    html = domicileFavoriSVG(color)
  } else {
    html = favoriSVG(label, color)
  }
  return createDivIcon(html, [30, 38], [15, 36], [0, -36])
}

export type PublicServiceType =
  | 'school'
  | 'hospital'
  | 'library'
  | 'townhall'
  | 'police'
  | 'fire_station'
  | 'community_centre'
  | 'public_building'
  | 'courthouse'

function getPublicServiceIconSVG(type: PublicServiceType): string {
  switch (type) {
    case 'school':           return renderToStaticMarkup(FaSchool({ color: MAP_COLORS.school, size: 16 }))
    case 'hospital':         return renderToStaticMarkup(FaHospital({ color: MAP_COLORS.hospital, size: 16 }))
    case 'library':          return renderToStaticMarkup(FaBook({ color: MAP_COLORS.brand, size: 16 }))
    case 'townhall':         return renderToStaticMarkup(FaLandmark({ color: MAP_COLORS.brandLight, size: 16 }))
    case 'police':           return renderToStaticMarkup(FaShieldAlt({ color: MAP_COLORS.routeAlt, size: 16 }))
    case 'fire_station':     return renderToStaticMarkup(FaFireExtinguisher({ color: MAP_COLORS.urgence, size: 16 }))
    case 'community_centre': return renderToStaticMarkup(FaUsers({ color: MAP_COLORS.rencontre, size: 16 }))
    case 'public_building':  return renderToStaticMarkup(FaBuilding({ color: MAP_COLORS.brandDark, size: 16 }))
    case 'courthouse':       return renderToStaticMarkup(FaGavel({ color: MAP_COLORS.brandDark, size: 16 }))
    default:                 return renderToStaticMarkup(FaBalanceScale({ color: MAP_COLORS.brandDark, size: 16 }))
  }
}

export function publicServiceSVG(type: PublicServiceType): string {
  const iconSVG = getPublicServiceIconSVG(type)
  let color: string = MAP_COLORS.brandDark
  switch (type) {
    case 'school':           color = MAP_COLORS.school; break
    case 'hospital':         color = MAP_COLORS.hospital; break
    case 'library':          color = MAP_COLORS.brand; break
    case 'townhall':         color = MAP_COLORS.brandLight; break
    case 'police':           color = MAP_COLORS.routeAlt; break
    case 'fire_station':     color = MAP_COLORS.urgence; break
    case 'community_centre': color = MAP_COLORS.rencontre; break
    case 'public_building':  color = MAP_COLORS.brandDark; break
    case 'courthouse':       color = MAP_COLORS.brandDark; break
  }
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28">
  <defs>
    <filter id="ms-pub" x="-35%" y="-35%" width="170%" height="170%">
      <feDropShadow dx="0" dy="1.5" stdDeviation="2" flood-color="rgba(0,0,0,0.18)"/>
    </filter>
  </defs>
  <circle cx="14" cy="14" r="11.5" fill="white" stroke="${color}" stroke-width="2" filter="url(#ms-pub)"/>
  <circle cx="14" cy="14" r="9.2" fill="${color}" opacity="0.12"/>
  <g transform="translate(7,7)">${iconSVG}</g>
</svg>`.trim()
}

export async function createPublicServiceIcon(type: PublicServiceType) {
  return createDivIcon(publicServiceSVG(type), [28, 28], [14, 14], [0, -14])
}
