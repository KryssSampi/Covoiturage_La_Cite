/**
 * server/services/TripService.ts — Délégation Trajets vers Server Core
 *
 * Endpoints : api/trips/*
 */

import { get, post, put, patch, type ApiResponse, type RequestOptions } from '../http-client';
import type { PaginatedResult } from './UserService';

// ── Types (alignés sur TrajetDtos du Server Core) ─────────────────────────────

export interface CreateTrajetDto {
  departureLat: number;
  departureLng: number;
  departureAddress: string;
  arrivalLat: number;
  arrivalLng: number;
  arrivalAddress: string;
  departureDate: string;
  departureTime: string;
  maxPassengers: number;
  pricePerPassenger: number;
  paymentMethod: string;
  tripType: string;
  conversationLevel?: string;
  vehicleId: string;
  notes?: string;
  polyline?: string;
  isRecurring?: boolean;
  recurringDays?: string[];
}

export type UpdateTrajetDto = Partial<CreateTrajetDto>;

export interface TrajetResponseDto {
  id: string;
  driverId: string;
  departureLat: number;
  departureLng: number;
  departureAddress: string;
  arrivalLat: number;
  arrivalLng: number;
  arrivalAddress: string;
  departureDate: string;
  departureTime: string;
  maxPassengers: number;
  currentPassengers: number;
  pricePerPassenger: number;
  passengerPrice: number;
  paymentMethod: string;
  tripType: string;
  status: string;
  conversationLevel?: string;
  vehicleId: string;
  notes?: string;
  polyline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrajetPassengerDto {
  userId: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  reservationId: string;
  reservationStatus: string;
}

export interface TrajetEnCoursDto {
  trip: TrajetResponseDto;
  passengers: TrajetPassengerDto[];
  driverPosition?: { lat: number; lng: number; updatedAt: string };
}

export interface CancelTripRequest {
  reason?: string;
}

export interface TrajetSearchParams {
  departureLat?: number;
  departureLng?: number;
  arrivalLat?: number;
  arrivalLng?: number;
  date?: string;
  radiusKm?: number;
  page?: number;
  pageSize?: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const TripService = {

  /** Recherche de trajets avec filtres géo */
  async search(params: TrajetSearchParams, options?: RequestOptions): Promise<ApiResponse<PaginatedResult<TrajetResponseDto>>> {
    return get<PaginatedResult<TrajetResponseDto>>('api/trips/search', {
      ...options,
      params: { ...params, ...options?.params } as Record<string, string | number | boolean | undefined>,
    });
  },

  /** Obtenir un trajet par ID */
  async getById(tripId: string, options?: RequestOptions): Promise<ApiResponse<TrajetResponseDto>> {
    return get<TrajetResponseDto>(`api/trips/${tripId}`, options);
  },

  /** Créer un trajet */
  async create(data: CreateTrajetDto, options?: RequestOptions): Promise<ApiResponse<TrajetResponseDto>> {
    return post<TrajetResponseDto>('api/trips', data, options);
  },

  /** Modifier un trajet */
  async update(tripId: string, data: UpdateTrajetDto, options?: RequestOptions): Promise<ApiResponse<TrajetResponseDto>> {
    return put<TrajetResponseDto>(`api/trips/${tripId}`, data, options);
  },

  /** Publier un brouillon */
  async publish(tripId: string, options?: RequestOptions): Promise<ApiResponse<TrajetResponseDto>> {
    return patch<TrajetResponseDto>(`api/trips/${tripId}/publish`, undefined, options);
  },

  /** Démarrer un trajet */
  async start(tripId: string, options?: RequestOptions): Promise<ApiResponse<TrajetResponseDto>> {
    return patch<TrajetResponseDto>(`api/trips/${tripId}/start`, undefined, options);
  },

  /** Compléter un trajet */
  async complete(tripId: string, options?: RequestOptions): Promise<ApiResponse<TrajetResponseDto>> {
    return patch<TrajetResponseDto>(`api/trips/${tripId}/complete`, undefined, options);
  },

  /** Annuler un trajet */
  async cancel(tripId: string, data?: CancelTripRequest, options?: RequestOptions): Promise<ApiResponse> {
    return post(`api/trips/${tripId}/cancel`, data, options);
  },

  /** Mes trajets en tant que conducteur */
  async getMyDriverTrips(status?: string, page = 1, pageSize = 20, options?: RequestOptions): Promise<ApiResponse<PaginatedResult<TrajetResponseDto>>> {
    return get<PaginatedResult<TrajetResponseDto>>('api/trips/mine/driver', {
      ...options,
      params: { page, pageSize, ...(status ? { status } : {}), ...options?.params },
    });
  },

  /** Passagers d'un trajet */
  async getPassengers(tripId: string, options?: RequestOptions): Promise<ApiResponse<TrajetPassengerDto[]>> {
    return get<TrajetPassengerDto[]>(`api/trips/${tripId}/passengers`, options);
  },

  /** Trajet en cours (live) */
  async getLive(tripId: string, options?: RequestOptions): Promise<ApiResponse<TrajetEnCoursDto>> {
    return get<TrajetEnCoursDto>(`api/trips/${tripId}/live`, options);
  },

  /** Sauvegarder un brouillon */
  async saveDraft(tripId: string, data: CreateTrajetDto, options?: RequestOptions): Promise<ApiResponse<TrajetResponseDto>> {
    return post<TrajetResponseDto>(`api/trips/${tripId}/save-draft`, data, options);
  },

  /** Trajets recommandés pour l'utilisateur courant (5 max, basé sur l'historique ou aléatoire) */
  async getRecommended(options?: RequestOptions): Promise<ApiResponse<TrajetResponseDto[]>> {
    return get<TrajetResponseDto[]>('api/trips/recommended', options);
  },
};
