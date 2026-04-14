/**
 * server/services/MatchingService.ts — Délégation Matching vers Server Core
 *
 * Endpoints : api/matching/*
 */

import { get, post, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types (alignés sur Server Core MatchingDtos) ──────────────────────────────

export interface MatchingSearchDto {
  departureLat?: number;
  departureLng?: number;
  arrivalLat?: number;
  arrivalLng?: number;
  departureRadiusMeters?: number;
  arrivalRadiusMeters?: number;
  date?: string;           // "YYYY-MM-DD"
  desiredHour?: number;    // heures décimales (ex: 8.5 = 08h30)
  desiredWeekday?: number; // 0=dim … 6=sam
  maxPrice?: number;
  minSeatsAvailable?: number;
  sortKey?: string;        // "matching_desc" | "price_asc" | "price_desc" | "departure_asc" | "seats_desc"
}

export interface MatchedTripDto {
  tripId: string;
  driverId: string;
  driverFirstName: string;
  driverLastName: string;
  driverAvatarUrl?: string;
  driverRating: number;
  driverTripCount: number;
  driverVerified: boolean;
  departureLabel: string;
  departureLat: number;
  departureLng: number;
  arrivalLabel: string;
  arrivalLat: number;
  arrivalLng: number;
  polyline?: string;
  departureDate: string;
  departureTime: string;
  estimatedDurationMinutes: number;
  estimatedDistanceKm: number;
  pricePerPassenger: number;
  passengerPrice: number;
  paymentMethod: string;
  maxPassengers: number;
  availableSeats: number;
  score: {
    total: number;
    geoDepart: number;
    geoArrivee: number;
    compatMusique: number;
    compatConversation: number;
    compatBagages: number;
    compatLangue: number;
    fiabiliteNote: number;
    fiabiliteAnnulation: number;
    fiabilitePonctualite: number;
    fiabiliteVerifie: number;
    affiniteFavoris: number;
    affiniteNote: number;
    affiniteTrajets: number;
    horaire: number;
    bonusRecurrence: number;
    eliminationReason?: string;
  };
}

export interface MatchingResultDto {
  trips: MatchedTripDto[];
  totalEvaluated: number;
  totalEliminated: number;
  totalMatched: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const MatchingService = {

  /** Recherche de matchs */
  async search(data: MatchingSearchDto, options?: RequestOptions): Promise<ApiResponse<MatchingResultDto>> {
    return post<MatchingResultDto>('api/matching/search', data, options);
  },

  /** Score de matching pour un trajet */
  async getScore(tripId: string, options?: RequestOptions): Promise<ApiResponse<MatchedTripDto['score']>> {
    return get<MatchedTripDto['score']>(`api/matching/score/${tripId}`, options);
  },
};
