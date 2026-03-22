// ─────────────────────────────────────────────────────────────────────────────
// map-service/types/index.ts
// Types centraux du MapService — partagés par tous les modules
// ─────────────────────────────────────────────────────────────────────────────

// ── Coordonnées ──────────────────────────────────────────────────────────────
export interface LatLng { lat: number; lng: number }
export interface BoundingBox { north: number; south: number; east: number; west: number }

// ── Fournisseurs de tuiles supportés ─────────────────────────────────────────
export type TileProvider =
  | 'carto-voyager'       // Coloré, routes différenciées — RECOMMANDÉ
  | 'carto-positron'      // Minimaliste blanc cassé
  | 'osm'                 // OpenStreetMap standard (backup)

// ── Mode du curseur de position ───────────────────────────────────────────────
export type CursorMode = 'arrow' | 'car'

// ── Types de marqueurs ────────────────────────────────────────────────────────
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

// ── Statut d'un marqueur (contrôle l'animation) ───────────────────────────────
export type MarkerStatus = 'normal' | 'selected' | 'pulse' | 'disabled' | 'urgence'

// ── Zones campus prédéfinies ──────────────────────────────────────────────────
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
  /** Polygone du périmètre (pour le geofence) */
  perimetre?: LatLng[]
  /** Capacité en véhicules */
  capacite?: number
}

// ── Config d'une tuile ────────────────────────────────────────────────────────
export interface TileConfig {
  url: string
  attribution: string
  subdomains?: string
  maxZoom: number
  /** Identifiant lisible */
  label: string
}

// ── Config globale de la carte ────────────────────────────────────────────────
export interface MapServiceConfig {
  tileProvider: TileProvider
  showBusStops: boolean
  showCampusZones: boolean
  showOffScreenButtons: boolean
  offScreenTargets: OffScreenTarget[]
  busStopMinZoom: number
  clusteringMinZoom: number
}

// ── Cible hors-écran ──────────────────────────────────────────────────────────
export interface OffScreenTarget {
  id: string
  label: string
  icone: string
  coordonnees: LatLng
  color?: string
}

// ── Résultat de requête Overpass ──────────────────────────────────────────────
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

// ── Style de polyline ─────────────────────────────────────────────────────────
export interface PolylineStyle {
  color: string
  weight: number
  opacity: number
  lineCap?: 'butt' | 'round' | 'square'
  lineJoin?: 'miter' | 'round' | 'bevel'
  dashArray?: string
}

// ── Options d'un popup ────────────────────────────────────────────────────────
export interface PopupOptions {
  maxWidth?: number
  className?: string
  closeButton?: boolean
}
