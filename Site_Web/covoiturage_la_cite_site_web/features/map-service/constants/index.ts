// ─────────────────────────────────────────────────────────────────────────────
// map-service/constants/index.ts
// Toutes les constantes partagées : couleurs, tuiles, zones campus
// ─────────────────────────────────────────────────────────────────────────────
import type { TileConfig, TileProvider, ZoneCampus, PolylineStyle, LatLng } from '../types'

// ═══════════════════════════════════════════════════════════════════════════
// COULEURS — palette cohérente avec le design system La Cité
// ═══════════════════════════════════════════════════════════════════════════
export const MAP_COLORS = {
  // Marque
  brand:         '#08316e',
  brandLight:    '#1a5cb0',
  brandDark:     '#051f4a',

  // Polyline
  routeDone:     '#08316e',
  routeRemain:   '#b8cce8',
  routeAlt:      '#7a90b8',

  // Marqueurs sémantiques
  depart:        '#0aad6a',
  arrivee:       '#e03050',
  rencontre:     '#0098c8',
  passager:      '#c8960a',
  urgence:       '#e03050',

  // POI OSM
  busStop:       '#5c3bbd',
  busStopBg:     'rgba(92,59,189,0.1)',
  gasStation:    '#d4600a',
  gasStationBg:  'rgba(212,96,10,0.09)',
  hospital:      '#e03050',
  park:          '#2d9a4a',
  school:        '#c8960a',

  // Campus La Cité
  campusZone:    '#08316e',
  campusFill:    'rgba(8,49,110,0.06)',
  campusBorder:  'rgba(8,49,110,0.22)',

  // Domicile
  home:          '#0aad6a',

  // Off-screen buttons
  offScreenBg:   'rgba(255,255,255,0.97)',
  offScreenBorder:'rgba(8,49,110,0.18)',

  // Radius de recherche
  radiusFill:    'rgba(8,49,110,0.05)',
  radiusBorder:  'rgba(8,49,110,0.2)',
} as const

// ═══════════════════════════════════════════════════════════════════════════
// FOURNISSEURS DE TUILES
// ═══════════════════════════════════════════════════════════════════════════
export const TILE_CONFIGS: Record<TileProvider, TileConfig> = {
  /**
   * CARTO Voyager — Recommandé pour La Cité Covoiturage
   * Routes colorées, labels clairs, POIs discrets, très lisible.
   * Gratuit, sans clé, attribution requise.
   */
  'carto-voyager': {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://carto.com/attributions" target="_blank">CARTO</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    label: 'CARTO Voyager',
  },

  /**
   * CARTO Positron — Minimaliste blanc
   * Idéal pour un mode « focus trajet ».
   */
  'carto-positron': {
    url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
    attribution: '© <a href="https://carto.com/attributions" target="_blank">CARTO</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
    subdomains: 'abcd',
    maxZoom: 19,
    label: 'CARTO Positron',
  },

  /**
   * OpenStreetMap standard — Backup
   */
  'osm': {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
    maxZoom: 19,
    label: 'OpenStreetMap',
  },
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES DE POLYLINES
// ═══════════════════════════════════════════════════════════════════════════
export const POLYLINE_STYLES: Record<string, PolylineStyle> = {
  done: {
    color:    MAP_COLORS.routeDone,
    weight:   5,
    opacity:  1,
    lineCap:  'round',
    lineJoin: 'round',
  },
  remain: {
    color:    MAP_COLORS.routeRemain,
    weight:   5,
    opacity:  0.75,
    lineCap:  'round',
    lineJoin: 'round',
  },
  alt: {
    color:     MAP_COLORS.routeAlt,
    weight:    4,
    opacity:   0.6,
    lineCap:   'round',
    lineJoin:  'round',
    dashArray: '8,5',
  },
  preview: {
    color:     MAP_COLORS.brand,
    weight:    3,
    opacity:   0.5,
    lineCap:   'round',
    lineJoin:  'round',
    dashArray: '6,4',
  },
} as const

// ═══════════════════════════════════════════════════════════════════════════
// ZONES CAMPUS LA CITÉ — Ottawa
// Coordonnées GPS réelles, 801 promenade de l'Aviation
// ═══════════════════════════════════════════════════════════════════════════
export const ZONES_CAMPUS: ZoneCampus[] = [
  {
    id: 'entree-principale',
    nom: 'Entrée Principale',
    icone: 'EP',
    instructions: 'Devant les portes vitrées principales, côté promenade de l\'Aviation.',
    // Sud du campus (ajusté)
    coordonnees: { lat: 45.438900, lng: -75.62678911601688 },
    capacite: 8,
  },
  {
    id: 'stationnement-a',
    nom: 'Stationnement A',
    icone: 'PA',
    instructions: 'Stationnement étudiants, accès par l\'avenue de la Cité.',
    // Ouest du campus (ajusté)
    coordonnees: { lat: 45.439453490367846, lng: -75.628000 },
    capacite: 40,
    perimetre: [
      { lat: 45.439000, lng: -75.628300 },
      { lat: 45.439900, lng: -75.628300 },
      { lat: 45.439900, lng: -75.627700 },
      { lat: 45.439000, lng: -75.627700 },
    ],
  },
  {
    id: 'stationnement-b',
    nom: 'Stationnement B',
    icone: 'PB',
    instructions: 'Stationnement personnel, côté nord du campus.',
    // Nord du campus (ajusté)
    coordonnees: { lat: 45.440000, lng: -75.62678911601688 },
    capacite: 35,
  },
  {
    id: 'stationnement-c',
    nom: 'Stationnement C',
    icone: 'PC',
    instructions: 'Stationnement visiteurs et dépose rapide.',
    // Est du campus (ajusté)
    coordonnees: { lat: 45.439453490367846, lng: -75.625600 },
    capacite: 20,
  },
  {
    id: 'arret-octranspo',
    nom: 'Arrêt OC Transpo',
    icone: 'BUS',
    instructions: 'Arrêt bus campus, lignes 11 et 16. Abri couvert disponible.',
    // Sud-Est (ajusté)
    coordonnees: { lat: 45.438900, lng: -75.625900 },
  },
  {
    id: 'bibliotheque',
    nom: 'Bibliothèque',
    icone: 'BIB',
    instructions: 'Entrée nord de la bibliothèque, sous l\'auvent.',
    // Nord-Est (ajusté)
    coordonnees: { lat: 45.440000, lng: -75.625900 },
  },
  {
    id: 'centre-sportif',
    nom: 'Centre Sportif',
    icone: 'GYM',
    instructions: 'Entrée principale du centre sportif.',
    // Nord-Ouest (ajusté)
    coordonnees: { lat: 45.440000, lng: -75.628000 },
  },
]

/** Polygone du périmètre global du campus La Cité */
// Polygone réaliste autour du campus La Cité (6 points, rotation corrigée)
export const CAMPUS_PERIMETER: LatLng[] = [
  { lat: 45.438700, lng: -75.625300 }, // Sud-Est (anciennement Sud-Ouest)
  { lat: 45.438700, lng: -75.628300 }, // Sud-Ouest (anciennement Sud-Est)
  { lat: 45.439700, lng: -75.628300 }, // Angle Ouest
  { lat: 45.440700, lng: -75.628300 }, // Nord-Ouest
  { lat: 45.440700, lng: -75.626000 }, // Angle Nord-Est
  { lat: 45.440200, lng: -75.625300 }, // Nord-Est
]

// ═══════════════════════════════════════════════════════════════════════════
// CONFIG PAR DÉFAUT DU MAP SERVICE
// ═══════════════════════════════════════════════════════════════════════════
export const DEFAULT_MAP_SERVICE_CONFIG = {
  tileProvider:         'carto-voyager' as TileProvider,
  showBusStops:         false,
  showCampusZones:      true,
  showOffScreenButtons: true,
  busStopMinZoom:       14,
  clusteringMinZoom:    13,
  offScreenTargets: [
    {
      id: 'campus',
      label: 'Campus La Cité',
      icone: '🎓',  // Sera masqué — le SVG du marqueur campus est utilisé à la place
      coordonnees: { lat: 45.439453490367846, lng: -75.62678911601688 },
      color: MAP_COLORS.brand,
    },
  ],
}

// ═══════════════════════════════════════════════════════════════════════════
// ZOOM THRESHOLDS — quoi afficher à quel zoom
// ═══════════════════════════════════════════════════════════════════════════
export const ZOOM_THRESHOLDS = {
  campusPolygon:   13,
  campusZones:     15,
  busStops:        14,
  gasStations:     13,
  publicServices:  14,
  streetLabels:    16,
} as const
