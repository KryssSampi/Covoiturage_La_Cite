// ─────────────────────────────────────────────────────────────────────────────
// features/trajet-en-cours/types/map.types.ts
// Types pour la carte temps réel du trajet en cours
// ─────────────────────────────────────────────────────────────────────────────

export interface LatLng { lat: number; lng: number }

export type CursorMode = 'arrow' | 'car'

// Un point de la polyline avec sa distance cumulée depuis le départ (mètres)
export interface WaypointWithDistance {
  latlng: LatLng
  distFromStart: number // mètres cumulés depuis le début
  heading?: number      // cap en degrés (calculé automatiquement)
}

export interface TrajetMapFixture {
  id: string
  label: string
  depart: LatLng
  arrivee: LatLng
  labelDepart: string
  labelArrivee: string
  vitesseMoyenneKmh: number    // pour la simulation (50 km/h)
  polyline: LatLng[]           // points GPS réels de la route
  distanceTotaleM: number      // distance totale en mètres
}

export interface TrajetMapState {
  fixture: TrajetMapFixture
  waypoints: WaypointWithDistance[]   // polyline enrichie avec distances
  positionActuelle: LatLng             // position courante du véhicule
  headingActuel: number                // cap en degrés
  distanceParcourue: number            // mètres parcourus
  pourcentageComplete: number          // 0–100
  estTermine: boolean
  prochainFixture: TrajetMapFixture | null  // pré-calculé à 1 min de la fin
}

export interface MapConfig {
  cursorMode: CursorMode
  showLegend: boolean
  autoCenter: boolean   // recentre la map sur le curseur
  zoom: number
}

// WebSocket ready (non connecté)
export interface TrajetMapSocketPayload {
  tripId: string
  lat: number
  lng: number
  speed: number          // km/h
  heading: number        // degrés
  timestamp: number      // unix ms
  distanceParcourue: number
}

export interface TrajetMapSocketHook {
  isConnected: boolean
  connect: (tripId: string, url: string) => void
  disconnect: () => void
  onPositionUpdate: (cb: (payload: TrajetMapSocketPayload) => void) => void
}

export interface TrajetMapProps {
  /**
   * Fixture initiale. Si absent, la fixture par défaut (Campus → Orléans) est utilisée.
   */
  fixture?: TrajetMapFixture
  /** Hauteur CSS du conteneur carte. Défaut : "360px" */
  height?: string
  /** Rôle de l'utilisateur — le bouton GPS n'est visible que pour le conducteur */
  role?: 'driver' | 'passenger'
  /** ID du trajet pour WebSocket futur */
  trajetId?: string
  /**
   * État externe fourni par useTrajetMap (levé dans le parent).
   * Quand fourni, TrajetMap n'instancie pas son propre hook.
   */
  trajetHook?: {
    state: TrajetMapState
    recalculerItineraire: () => Promise<void>
    isRecalculating: boolean
  }
}
