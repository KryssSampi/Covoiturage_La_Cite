// ─────────────────────────────────────────────────────────────────────────────
// map-service/types/index.ts  — copie verbatim du site web
// ─────────────────────────────────────────────────────────────────────────────

export interface LatLng { lat: number; lng: number }
export interface BoundingBox { north: number; south: number; east: number; west: number }

export type TileProvider =
  | 'carto-voyager'
  | 'carto-positron'
  | 'osm'

export type CursorMode = 'arrow' | 'car'

export type MarkerType =
  | 'depart'
  | 'arrivee'
  | 'cursor'
  | 'rencontre'
  | 'passager'
  | 'cluster'
  | 'bus-stop'
  | 'gas-station'
  | 'campus-zone'
  | 'domicile'

export type MarkerStatus = 'normal' | 'selected' | 'pulse' | 'disabled' | 'urgence'

export type ZoneCampusId =
  | 'entree-principale'
  | 'stationnement-a'
  | 'stationnement-b'
  | 'stationnement-c'
  | 'arret-octranspo'
  | 'bibliotheque'
  | 'centre-sportif'

export interface ZoneCampus {
  id: ZoneCampusId
  nom: string
  icone: string
  instructions: string
  coordonnees: LatLng
  perimetre?: LatLng[]
  capacite?: number
}

export interface TileConfig {
  url: string
  attribution: string
  subdomains?: string
  maxZoom: number
  label: string
}

export interface MapServiceConfig {
  tileProvider: TileProvider
  showBusStops: boolean
  showCampusZones: boolean
  showOffScreenButtons: boolean
  offScreenTargets: OffScreenTarget[]
  busStopMinZoom: number
  clusteringMinZoom: number
}

export interface OffScreenTarget {
  id: string
  label: string
  icone: string
  coordonnees: LatLng
  color?: string
}

export interface OverpassElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  tags?: Record<string, string>
  center?: { lat: number; lon: number }
}

export interface OverpassResult {
  elements: OverpassElement[]
}

export interface PolylineStyle {
  color: string
  weight: number
  opacity: number
  lineCap?: 'butt' | 'round' | 'square'
  lineJoin?: 'miter' | 'round' | 'bevel'
  dashArray?: string
}

export interface PopupOptions {
  maxWidth?: number
  className?: string
  closeButton?: boolean
}
