/**
 * @file matchingV4.ts
 * @description Algorithme de matching optimal v4 — fonction pure côté serveur.
 *
 * PHILOSOPHIE
 * ───────────
 * Chaque signal correspond à quelque chose que l'app connaît réellement.
 * Objectif : que chaque trajet en tête de liste soit un trajet où conducteur
 * et passager n'auront aucune raison de se disputer.
 *
 * ARCHITECTURE EN 3 PHASES
 * ─────────────────────────
 * Phase 0 — Hard Eliminators  : conflit garanti → rejet immédiat, sans score
 * Phase 1 — Scoring 0–100     : 5 blocs, chacun mesure un axe de compatibilité
 * Phase 2 — Tri & retour      : matching_desc par défaut
 *
 * SCORES (total 100 pts + bonus récurrence hors plafond)
 * ──────────────────────────────────────────────────────
 * Bloc A — Géographie précise                20 pts
 * Bloc B — Compatibilité comportementale     30 pts  ← cœur anti-litige
 * Bloc C — Fiabilité conducteur              25 pts
 * Bloc D — Affinité sociale                  15 pts
 * Bloc E — Horaire                           10 pts
 * Bonus   — Récurrence sur bon jour          +5 pts  (hors plafond)
 */

import type { TripModel } from '@/core/models/TripModel';
import type { UserModel } from '@/core/models/UserModel';
import type { UserPreferencesModel } from '@/core/models/UserPreferencesModel';
import type { AffiniteRecord } from '@/core/models/AffiniteModel';
import type { PassengerSortKey } from '@/features/search/types/search.feature.types';

// ─── Types exportés ───────────────────────────────────────────────────────────

export interface MatchingScoreV4 {
  total: number;

  geoDepart:              number;   // max 12
  geoArrivee:             number;   // max 8
  compatMusique:          number;   // max 8
  compatConversation:     number;   // max 10
  compatBagages:          number;   // max 6
  compatLangue:           number;   // max 6
  fiabiliteNote:          number;   // max 10
  fiabiliteAnnulation:    number;   // max 8
  fiabilitePonctualite:   number;   // max 5
  fiabiliteVerifie:       number;   // max 2
  affiniteFavoris:        number;   // max 10
  affiniteNote:           number;   // max 5
  affiniteTrajets:        number;   // max 5
  affinitePassagersBord:  number;   // max 3 (bonus)
  horaire:                number;   // max 10
  bonusRecurrence:        number;   // +5 hors plafond

  eliminated?: EliminationReason;
}

export type EliminationReason =
  | 'trip_not_published'
  | 'trip_full'
  | 'already_passenger'
  | 'geo_departure_too_far'
  | 'geo_arrival_too_far'
  | 'payment_incompatible'
  | 'goscore_too_low'
  | 'bad_past_experience'
  | 'passenger_unreliable';

export interface PassengerSearchParams {
  trips: TripModel[];
  passenger: UserModel;
  passengerPrefs: UserPreferencesModel | null;
  drivers: Map<string, UserModel>;
  affinites: AffiniteRecord[];
  departureCoords: [number, number] | null;   // [lng, lat]
  arrivalCoords: [number, number] | null;     // [lng, lat]
  desiredHour?: number;
  desiredWeekday?: number;
  maxPrice?: number;
  minSeatsAvailable?: number;
  departureRadiusMeters?: number;
  arrivalRadiusMeters?: number;
  sortKey?: PassengerSortKey;
}

export interface PassengerSearchResult {
  trips: TripModel[];
  scores: Record<string, MatchingScoreV4>;
  eliminated: Record<string, EliminationReason>;
}

// ─── DTO retourné au client (sans données sensibles) ──────────────────────────

export interface TripSearchDTO {
  id: string;
  departure: { label: string; fullAddress: string; coordinates: { lat: number; lng: number }; instructions?: string };
  arrival:   { label: string; fullAddress: string; coordinates: { lat: number; lng: number }; instructions?: string };
  departureDate: string;
  departureTime: string;
  estimatedArrivalTime?: string;
  estimatedDistanceKm?: number;
  estimatedDurationMinutes?: number;
  pricePerPassenger: number;
  paymentMethod: string;
  maxPassengers: number;
  availableSeats: number;
  tripType: string;
  recurrenceDays?: number[];
  preferences: {
    baggageAllowed: boolean;
    petsAllowed: boolean;
    smokingAllowed: boolean;
    musicAllowed: boolean;
    flexibleItinerary: boolean;
    conversationLevel: string;
    driverNote?: string;
  };
  languagePreference?: string;
  maxBaggageLevel?: string;
  polyline: [number, number][];
  driver: {
    id: string;
    firstName: string;
    avatarUrl?: string;
    rating: number;
    tripCount: number;
    profileVerified: boolean;
  };
  matchingScore: MatchingScoreV4;
  blockedReason?: EliminationReason;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const EARTH_R = 6_371_000;
const DEFAULT_DEPARTURE_RADIUS = 1000;  // 1 km
const DEFAULT_ARRIVAL_RADIUS   = 1000;

const TRUST_BADGES = new Set([
  'badge-ponctuel', 'BADGE-PONCTUEL',
  'badge-fiable',   'BADGE-FIABLE',
  'badge-etudiant-cite', 'BADGE-ETUDIANT-CITE',
  'badge-expert',   'BADGE-EXPERT',
  'BADGE-SUPER-DRIVER', 'BADGE-VETERAN',
]);

type BaggageLevel = 'none' | 'light' | 'heavy';
const BAGGAGE_RANK: Record<BaggageLevel, number> = { none: 0, light: 1, heavy: 2 };

// ─── Utilitaires géographiques ────────────────────────────────────────────────

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toR = (d: number) => (d * Math.PI) / 180;
  const dLat = toR(lat2 - lat1);
  const dLng = toR(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toR(lat1)) * Math.cos(toR(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_R * Math.asin(Math.sqrt(a));
}

function geoScore(distMeters: number, maxPts: number, decayM = 400): number {
  return Math.round(maxPts * Math.exp(-distMeters / decayM));
}

// ─── Utilitaires de scoring ───────────────────────────────────────────────────

function convScore(passenger: string, trip: string): number {
  if (passenger === trip) return 10;
  const adj: Record<string, string[]> = {
    quiet:    ['moderate'],
    moderate: ['quiet', 'chatty'],
    chatty:   ['moderate'],
  };
  return (adj[passenger] ?? []).includes(trip) ? 5 : 0;
}

function langScore(passenger: string, trip: string): number {
  if (trip === 'any') return 6;
  if (passenger === trip) return 6;
  if (passenger === 'bilingual' || trip === 'bilingual') return 3;
  return 0;
}

function horaireScore(tripTime: string, desiredHour?: number): number {
  if (desiredHour === undefined) return 5;
  const [h, m] = tripTime.split(':').map(Number);
  const diff = Math.abs(h + m / 60 - desiredHour);
  if (diff <= 0.25) return 10;
  if (diff <= 0.5)  return 8;
  if (diff <= 1.0)  return 6;
  if (diff <= 2.0)  return 3;
  if (diff <= 3.0)  return 1;
  return 0;
}

function cancellationScore(rate: number): number {
  if (rate < 0.05) return 8;
  if (rate < 0.10) return 6;
  if (rate < 0.20) return 3;
  return 0;
}

function baggageScore(passenger: BaggageLevel, tripMax: BaggageLevel): number {
  const diff = BAGGAGE_RANK[tripMax] - BAGGAGE_RANK[passenger];
  if (diff >= 2) return 6;
  if (diff >= 1) return 4;
  return 2;
}

function getAffinite(userId: string, targetId: string, affinites: AffiniteRecord[]): AffiniteRecord | undefined {
  return affinites.find(
    (a) =>
      (a.idPersonneQuiAMisEnFavoris === userId && a.idPersonneEnFavoris === targetId) ||
      (a.idPersonneQuiAMisEnFavoris === targetId && a.idPersonneEnFavoris === userId)
  );
}

// ─── Fonction principale ──────────────────────────────────────────────────────

export function runPassengerMatchingV4(params: PassengerSearchParams): PassengerSearchResult {
  const {
    trips,
    passenger,
    passengerPrefs,
    drivers,
    affinites,
    departureCoords,
    arrivalCoords,
    desiredHour,
    desiredWeekday,
    maxPrice,
    minSeatsAvailable,
    sortKey = 'matching_desc',
  } = params;

  const depRadius = params.departureRadiusMeters ?? DEFAULT_DEPARTURE_RADIUS;
  const arrRadius = params.arrivalRadiusMeters   ?? DEFAULT_ARRIVAL_RADIUS;

  const scores: Record<string, MatchingScoreV4>    = {};
  const eliminated: Record<string, EliminationReason> = {};

  // Profil passager (combine UserModel + UserPreferencesModel)
  const passengerSmokes   = passengerPrefs?.smokesRegularly ?? false;
  const passengerHasPets  = passengerPrefs?.hasPets ?? false;
  const passengerBaggage  = (passengerPrefs?.typicalBaggageLevel ?? 'light') as BaggageLevel;
  const passengerPayments = passengerPrefs?.acceptedPaymentMethods ?? ['cash', 'interac'];
  const passengerLang     = passengerPrefs?.languagePreference ?? 'bilingual';
  const passengerConv     = passengerPrefs?.conversationLevel ?? passenger.preferences.conversationLevel;
  const passengerMusic    = passengerPrefs?.musicAccepted ?? passenger.preferences.musicAccepted;
  const passengerNoShows  = passenger.passengerProfile.noShowCount;
  const passengerGoScore  = passenger.goScore;

  const validTripIds: string[] = [];

  for (const trip of trips) {

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 0 — HARD ELIMINATORS
    // ══════════════════════════════════════════════════════════════════════════

    const elim = (reason: EliminationReason) => { eliminated[trip.id] = reason; };

    if (trip.status !== 'published') { elim('trip_not_published'); continue; }
    if (trip.currentPassengers >= trip.maxPassengers) { elim('trip_full'); continue; }
    if (trip.passengerIds?.includes(passenger.id)) { elim('already_passenger'); continue; }

    if (departureCoords && trip.departure?.coordinates) {
      const dist = haversine(
        departureCoords[1], departureCoords[0],
        trip.departure.coordinates.lat, trip.departure.coordinates.lng
      );
      if (dist > depRadius) { elim('geo_departure_too_far'); continue; }
    }

    if (arrivalCoords && trip.arrival?.coordinates) {
      const dist = haversine(
        arrivalCoords[1], arrivalCoords[0],
        trip.arrival.coordinates.lat, trip.arrival.coordinates.lng
      );
      if (dist > arrRadius) { elim('geo_arrival_too_far'); continue; }
    }

    const tripMaxBaggage = (trip.maxBaggageLevel ?? (trip.preferences.baggageAllowed ? 'heavy' : 'light')) as BaggageLevel;

    if (!passengerPayments.includes(trip.paymentMethod as 'cash' | 'interac')) {
      elim('payment_incompatible'); continue;
    }

    const minGoScore = trip.minPassengerGoScore ?? 0;
    if (passengerGoScore < minGoScore) { elim('goscore_too_low'); continue; }

    const affinite = getAffinite(passenger.id, trip.driverId, affinites);
    if (affinite && affinite.noteAffinite === 1) { elim('bad_past_experience'); continue; }

    if (passengerNoShows >= 3) { elim('passenger_unreliable'); continue; }

    // ══════════════════════════════════════════════════════════════════════════
    // PHASE 1 — SCORING
    // ══════════════════════════════════════════════════════════════════════════

    const driver = drivers.get(trip.driverId);

    // ── BLOC A — Géographie (20 pts) ─────────────────────────────────────────
    let geoDepart  = 6;
    let geoArrivee = 4;

    if (departureCoords && trip.departure?.coordinates) {
      const dist = haversine(
        departureCoords[1], departureCoords[0],
        trip.departure.coordinates.lat, trip.departure.coordinates.lng
      );
      geoDepart = geoScore(dist, 12, 400);
    }
    if (arrivalCoords && trip.arrival?.coordinates) {
      const dist = haversine(
        arrivalCoords[1], arrivalCoords[0],
        trip.arrival.coordinates.lat, trip.arrival.coordinates.lng
      );
      geoArrivee = geoScore(dist, 8, 400);
    }

    // ── BLOC B — Compatibilité comportementale (30 pts) ───────────────────────
    const compatMusique      = passengerMusic === trip.preferences.musicAllowed ? 8 : 3;
    const compatConversation = convScore(passengerConv, trip.preferences.conversationLevel);
    const compatBagages      = BAGGAGE_RANK[passengerBaggage] > BAGGAGE_RANK[tripMaxBaggage]
      ? 0
      : baggageScore(passengerBaggage, tripMaxBaggage);
    const compatLangue       = langScore(passengerLang, trip.languagePreference ?? 'any');
    const compatAnimaux      = passengerHasPets
      ? (trip.preferences.petsAllowed ? 3 : 0)
      : 3;
    const compatFumeur       = passengerSmokes
      ? (trip.preferences.smokingAllowed ? 3 : 0)
      : 3;
    const blocB = compatMusique + compatConversation + compatBagages + compatLangue + compatAnimaux + compatFumeur;

    // ── BLOC C — Fiabilité conducteur (25 pts) ────────────────────────────────
    const driverRating      = driver?.driverProfile?.averageRating ?? 4.0;
    const driverCancelRate  = driver?.driverProfile?.cancellationRate ?? 0.1;
    const driverPunctuality = driver?.driverProfile?.punctualityScore ?? 80;
    const driverVerified    = driver?.profileVerified ?? false;
    const driverBadges      = driver?.badgeIds ?? [];

    const fiabiliteNote        = Math.round((driverRating / 5) * 10);
    const fiabiliteAnnulation  = cancellationScore(driverCancelRate);
    const fiabilitePonctualite = Math.round((driverPunctuality / 100) * 5);
    const fiabiliteVerifie     = driverVerified ? 2 : 0;
    const badgeBonus           = Math.min(3, driverBadges.filter((b: string) => TRUST_BADGES.has(b)).length);
    const blocC = Math.min(25, fiabiliteNote + fiabiliteAnnulation + fiabilitePonctualite + fiabiliteVerifie + badgeBonus);

    // ── BLOC D — Affinité sociale (15 pts) ────────────────────────────────────
    let affiniteFavoris       = 0;
    let affiniteNoteScore     = 0;
    let affiniteTrajetsScore  = 0;
    let affinitePassagersBord = 0;

    if (affinite) {
      if (affinite.isActuallyFavorite) {
        affiniteFavoris = 10;
      } else {
        const noteMap: Record<number, number> = { 0: 3, 2: 6, 3: 10 };
        affiniteNoteScore = noteMap[affinite.noteAffinite] ?? 0;
      }
      affiniteTrajetsScore = Math.min(5, Math.floor(affinite.totalTrajetsEnsemble / 2));
    }

    const coPassengerAffinity = (trip.passengerIds ?? []).some((pid: string) => {
      const aff = getAffinite(passenger.id, pid, affinites);
      return aff && (aff.isActuallyFavorite || aff.noteAffinite >= 2);
    });
    if (coPassengerAffinity) affinitePassagersBord = 3;

    const blocD = Math.min(15, affiniteFavoris + affiniteNoteScore + affiniteTrajetsScore + affinitePassagersBord);

    // ── BLOC E — Horaire (10 pts) ──────────────────────────────────────────────
    const horaire = trip.departureTime ? horaireScore(trip.departureTime, desiredHour) : 5;

    // ── BONUS — Récurrence (+5) ───────────────────────────────────────────────
    let bonusRecurrence = 0;
    if (trip.tripType === 'recurrent' && desiredWeekday !== undefined && trip.recurrenceDays?.includes(desiredWeekday)) {
      bonusRecurrence = 5;
    }

    const baseScore = geoDepart + geoArrivee + blocB + blocC + blocD + horaire;
    const total     = Math.min(100, baseScore) + bonusRecurrence;

    scores[trip.id] = {
      total,
      geoDepart,
      geoArrivee,
      compatMusique,
      compatConversation,
      compatBagages,
      compatLangue,
      fiabiliteNote,
      fiabiliteAnnulation,
      fiabilitePonctualite,
      fiabiliteVerifie,
      affiniteFavoris,
      affiniteNote:           affiniteNoteScore,
      affiniteTrajets:        affiniteTrajetsScore,
      affinitePassagersBord,
      horaire,
      bonusRecurrence,
    };

    validTripIds.push(trip.id);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // PHASE 2 — FILTRAGE ADDITIONNEL + TRI
  // ══════════════════════════════════════════════════════════════════════════

  let result = trips.filter((t) => {
    if (!scores[t.id]) return false;
    if (maxPrice !== undefined && t.pricePerPassenger > maxPrice) return false;
    if (minSeatsAvailable !== undefined && (t.maxPassengers - t.currentPassengers) < minSeatsAvailable) return false;
    return true;
  });

  switch (sortKey) {
    case 'matching_desc':
      result.sort((a, b) => {
        const diff = (scores[b.id]?.total ?? 0) - (scores[a.id]?.total ?? 0);
        return diff !== 0 ? diff : a.pricePerPassenger - b.pricePerPassenger;
      });
      break;
    case 'price_asc':
      result.sort((a, b) => a.pricePerPassenger - b.pricePerPassenger);
      break;
    case 'price_desc':
      result.sort((a, b) => b.pricePerPassenger - a.pricePerPassenger);
      break;
    case 'departure_asc':
      result.sort((a, b) => {
        const dA = new Date(`${a.departureDate}T${a.departureTime || '00:00'}`).getTime();
        const dB = new Date(`${b.departureDate}T${b.departureTime || '00:00'}`).getTime();
        return dA - dB;
      });
      break;
    case 'seats_desc':
      result.sort((a, b) => (b.maxPassengers - b.currentPassengers) - (a.maxPassengers - a.currentPassengers));
      break;
  }

  return { trips: result, scores, eliminated };
}

// ─── Convertisseur TripModel → TripSearchDTO ─────────────────────────────────

export function toTripSearchDTO(
  trip: TripModel,
  driver: UserModel | undefined,
  score: MatchingScoreV4,
  blockedReason?: EliminationReason,
): TripSearchDTO {
  return {
    id:                       trip.id,
    departure:                trip.departure,
    arrival:                  trip.arrival,
    departureDate:            trip.departureDate,
    departureTime:            trip.departureTime,
    estimatedArrivalTime:     trip.estimatedArrivalTime,
    estimatedDistanceKm:      trip.estimatedDistanceKm,
    estimatedDurationMinutes: trip.estimatedDurationMinutes,
    pricePerPassenger:        trip.pricePerPassenger,
    paymentMethod:            trip.paymentMethod,
    maxPassengers:            trip.maxPassengers,
    availableSeats:           trip.maxPassengers - trip.currentPassengers,
    tripType:                 trip.tripType,
    recurrenceDays:           trip.recurrenceDays,
    preferences:              trip.preferences,
    languagePreference:       trip.languagePreference,
    maxBaggageLevel:          trip.maxBaggageLevel,
    polyline:                 trip.polyline,
    driver: {
      id:              driver?.id ?? trip.driverId,
      firstName:       driver?.firstName ?? 'Conducteur',
      avatarUrl:       driver?.avatarUrl ?? undefined,
      rating:          driver?.driverProfile?.averageRating ?? 4.0,
      tripCount:       driver?.driverProfile?.totalTripsAsDriver ?? 0,
      profileVerified: driver?.profileVerified ?? false,
    },
    matchingScore: score,
    blockedReason,
  };
}
