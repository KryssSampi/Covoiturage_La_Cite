// ─────────────────────────────────────────────────────────────────────────────
// fixtures/circuits.fixtures.ts
// Circuits de test pré-calculés — Ottawa, Vanier → Campus La Cité
// Coordonnées OSRM réelles, polylines simplifiées pour dev offline
// ─────────────────────────────────────────────────────────────────────────────
import type { MapCircuit } from '@/types'

// Départ : Vanier (résidentiel typique) [lng, lat]
const DEP: [number, number] = [-75.6557, 45.4349]
// Arrivée : Campus La Cité [lng, lat]
const ARR: [number, number] = [-75.6268, 45.4395]

const DEP_LABEL = 'Avenue de la Paix, Vanier'
const ARR_LABEL = 'Campus La Cité, 801 promenade de l\'Aviation'

/**
 * Circuit principal — via Autoroute 174 / Montréal Rd
 * ~5.2 km, ~9 min
 */
const circuitPrincipal: MapCircuit = {
  routeIndex: 0,
  duration:   542,
  distance:   5180,
  summary:    'via Montreal Rd / chemin Montréal',
  departureCoords: DEP,
  arrivalCoords:   ARR,
  departureLabel:  DEP_LABEL,
  arrivalLabel:    ARR_LABEL,
  waypointCoords:  [],
  latLngs: [
    [45.4349, -75.6557],
    [45.4352, -75.6520],
    [45.4358, -75.6480],
    [45.4367, -75.6440],
    [45.4372, -75.6410],
    [45.4378, -75.6390],
    [45.4382, -75.6365],
    [45.4388, -75.6340],
    [45.4390, -75.6320],
    [45.4391, -75.6310],
    [45.4392, -75.6295],
    [45.4393, -75.6285],
    [45.4394, -75.6275],
    [45.4395, -75.6268],
  ],
}

/**
 * Circuit alternatif 1 — via Donald St / Ogilvie Rd (nord)
 * ~6.1 km, ~11 min
 */
const circuitAlt1: MapCircuit = {
  routeIndex: 1,
  duration:   660,
  distance:   6100,
  summary:    'via Ogilvie Rd / chemin Ogilvie',
  departureCoords: DEP,
  arrivalCoords:   ARR,
  departureLabel:  DEP_LABEL,
  arrivalLabel:    ARR_LABEL,
  waypointCoords:  [[-75.641, 45.447]],
  latLngs: [
    [45.4349, -75.6557],
    [45.4360, -75.6545],
    [45.4375, -75.6530],
    [45.4400, -75.6510],
    [45.4420, -75.6490],
    [45.4435, -75.6465],
    [45.4440, -75.6440],
    [45.4438, -75.6410],
    [45.4430, -75.6385],
    [45.4420, -75.6360],
    [45.4410, -75.6335],
    [45.4403, -75.6310],
    [45.4399, -75.6290],
    [45.4396, -75.6275],
    [45.4395, -75.6268],
  ],
}

/**
 * Circuit alternatif 2 — via McArthur Ave (sud)
 * ~5.8 km, ~10 min
 */
const circuitAlt2: MapCircuit = {
  routeIndex: 2,
  duration:   600,
  distance:   5800,
  summary:    'via McArthur Ave / avenue McArthur',
  departureCoords: DEP,
  arrivalCoords:   ARR,
  departureLabel:  DEP_LABEL,
  arrivalLabel:    ARR_LABEL,
  waypointCoords:  [[-75.643, 45.432]],
  latLngs: [
    [45.4349, -75.6557],
    [45.4342, -75.6540],
    [45.4335, -75.6515],
    [45.4328, -75.6490],
    [45.4322, -75.6465],
    [45.4320, -75.6440],
    [45.4323, -75.6415],
    [45.4330, -75.6390],
    [45.4340, -75.6365],
    [45.4352, -75.6345],
    [45.4363, -75.6325],
    [45.4373, -75.6308],
    [45.4381, -75.6292],
    [45.4388, -75.6278],
    [45.4395, -75.6268],
  ],
}

export const FIXTURE_CIRCUITS: MapCircuit[] = [
  circuitPrincipal,
  circuitAlt1,
  circuitAlt2,
]

/** Labels des circuits pour affichage dans le DevPanel */
export const CIRCUIT_LABELS = ['Principal', 'Alternatif 1', 'Alternatif 2']

/** Formatage durée secondes → "X min" */
export function formatDuration(seconds: number): string {
  const m = Math.round(seconds / 60)
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`
}

/** Formatage distance mètres → "X.X km" */
export function formatDistance(meters: number): string {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${meters} m`
}
