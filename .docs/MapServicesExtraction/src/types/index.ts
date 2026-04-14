// ─────────────────────────────────────────────────────────────────────────────
// types/index.ts
// Types partagés du projet standalone — circuits, bridge WebView, favoris
// ─────────────────────────────────────────────────────────────────────────────

// ── MapCircuit — miroir exact du type web ─────────────────────────────────────
// Produit par fetchCircuits() (routing.ts) ou envoyé depuis C# via postMessage
export interface MapCircuit {
  routeIndex:      number
  latLngs:         [number, number][]   // [[lat, lng], ...]
  waypointCoords?: [number, number][]
  duration:        number               // secondes
  distance:        number               // mètres
  summary:         string               // "via Rue X, Rue Y"
  departureCoords: [number, number]     // [lng, lat] format OSRM
  arrivalCoords:   [number, number]     // [lng, lat] format OSRM
  departureLabel:  string
  arrivalLabel:    string
}

// ── RouteResult — résultat d'une route simple ─────────────────────────────────
export interface RouteResult {
  latLngs:  [number, number][]
  duration: number
  distance: number
}

// ── LieuFavoriUnifie — lieu favori (requis par la couche favorites) ───────────
export interface LieuFavoriUnifie {
  id:          string
  pseudonyme:  string
  adresse:     string
  coordonnees: { lat: number; lng: number }
  iconTag:     string   // 'domicile' | 'campus' | 'travail' | 'ville' | 'autre'
  isAnchored?: boolean
}

// ── MapConfig — configuration dynamique de la carte ──────────────────────────
export interface MapConfig {
  tileProvider:      'carto-voyager' | 'carto-positron' | 'osm'
  showCampusZones:   boolean
  showBusStops:      boolean
  showGasStations:   boolean
  showPublicServices:boolean
}

export const DEFAULT_MAP_CONFIG: MapConfig = {
  tileProvider:       'carto-voyager',
  showCampusZones:    true,
  showBusStops:       false,
  showGasStations:    true,
  showPublicServices: true,
}

// ─────────────────────────────────────────────────────────────────────────────
// Bridge WebView — messages entrants (C# → WebView) et sortants (WebView → C#)
// Protocole : window.postMessage(JSON.stringify(msg), '*')
// ─────────────────────────────────────────────────────────────────────────────

/** Messages reçus par la WebView (envoyés depuis C#) */
export type BridgeIncoming =
  | { type: 'SET_CIRCUITS';    circuits: MapCircuit[]; activeIndex?: number }
  | { type: 'SELECT_CIRCUIT';  index: number }
  | { type: 'SET_CONFIG';      config: Partial<MapConfig> }
  | { type: 'FLY_TO';          lat: number; lng: number; zoom?: number }
  | { type: 'CLEAR_MAP' }

/** Messages émis par la WebView vers C# */
export type BridgeOutgoing =
  | { type: 'MAP_READY' }
  | { type: 'CIRCUIT_SELECTED'; index: number; circuit: MapCircuit }
  | { type: 'MAP_CLICK';        lat: number; lng: number }
  | { type: 'CIRCUITS_LOADED';  count: number }
