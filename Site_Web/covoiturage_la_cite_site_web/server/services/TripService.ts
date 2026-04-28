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

export interface TripDriverDto {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  averageRating: number;
  goScore: number;
  isProfileVerified: boolean;
}

export interface TripVehicleDto {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  capacity: number;
  photoUrl?: string;
}

export interface TrajetResponseDto {
  id: string;
  driverId: string;
  vehicleId: string;
  departureLabel: string;
  departureAddress: string;
  departureLat: number;
  departureLng: number;
  arrivalLabel: string;
  arrivalAddress: string;
  arrivalLat: number;
  arrivalLng: number;
  departureDate: string;
  departureTime: string;
  estimatedArrivalTime?: string;
  estimatedDurationMinutes: number;
  estimatedDistanceKm?: number;
  maxPassengers: number;
  currentPassengers: number;
  pricePerPassenger: number;
  paymentMethod: string;
  tripType: string;
  status: string;
  conversationLevel?: string;
  driverNote?: string;
  polyline?: string;
  baggageAllowed?: boolean;
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  musicAllowed?: boolean;
  co2SavedKg?: number;
  averageRating?: number;
  createdAt: string;
  updatedAt: string;
  driver?: TripDriverDto;
  vehicle?: TripVehicleDto;
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

interface TrajetEnCoursCoreDto {
  id: string;
  status: string;
  driver?: TripDriverDto;
  vehicle?: TripVehicleDto;
  departureLabel?: string;
  departureAddress?: string;
  departureLat?: number;
  departureLng?: number;
  arrivalLabel?: string;
  arrivalAddress?: string;
  arrivalLat?: number;
  arrivalLng?: number;
  polyline?: string;
  departureDate?: string;
  departureTime?: string;
  estimatedArrivalTime?: string;
  actualStartedAt?: string;
  passengers?: TrajetPassengerDto[];
  currentLat?: number;
  currentLng?: number;
  lastGpsUpdate?: string;
}

function normalizeLivePayload(payload: unknown): TrajetEnCoursDto {
  if (payload && typeof payload === 'object' && 'trip' in (payload as Record<string, unknown>)) {
    return payload as TrajetEnCoursDto;
  }

  const raw = (payload ?? {}) as TrajetEnCoursCoreDto;
  const vehicleId = raw.vehicle?.id ?? '';
  const trip: TrajetResponseDto = {
    id: raw.id ?? '',
    driverId: raw.driver?.id ?? '',
    vehicleId,
    departureLabel: raw.departureLabel ?? raw.departureAddress ?? '',
    departureAddress: raw.departureAddress ?? raw.departureLabel ?? '',
    departureLat: raw.departureLat ?? 0,
    departureLng: raw.departureLng ?? 0,
    arrivalLabel: raw.arrivalLabel ?? raw.arrivalAddress ?? '',
    arrivalAddress: raw.arrivalAddress ?? raw.arrivalLabel ?? '',
    arrivalLat: raw.arrivalLat ?? 0,
    arrivalLng: raw.arrivalLng ?? 0,
    departureDate: raw.departureDate ?? '',
    departureTime: raw.departureTime ?? '',
    estimatedArrivalTime: raw.estimatedArrivalTime,
    estimatedDurationMinutes: 0,
    estimatedDistanceKm: 0,
    maxPassengers: Array.isArray(raw.passengers) ? raw.passengers.length : 0,
    currentPassengers: Array.isArray(raw.passengers) ? raw.passengers.length : 0,
    pricePerPassenger: 0,
    paymentMethod: 'cash',
    tripType: 'unique',
    status: raw.status ?? 'in_progress',
    polyline: raw.polyline,
    createdAt: raw.actualStartedAt ?? new Date(0).toISOString(),
    updatedAt: raw.lastGpsUpdate ?? raw.actualStartedAt ?? new Date(0).toISOString(),
    driver: raw.driver,
    vehicle: raw.vehicle,
  };

  const passengers = Array.isArray(raw.passengers) ? raw.passengers : [];
  const hasPosition = typeof raw.currentLat === 'number' && typeof raw.currentLng === 'number';

  return {
    trip,
    passengers,
    driverPosition: hasPosition
      ? {
          lat: raw.currentLat!,
          lng: raw.currentLng!,
          updatedAt: raw.lastGpsUpdate ?? new Date().toISOString(),
        }
      : undefined,
  };
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
    const response = await get<unknown>(`api/trips/${tripId}/live`, options);
    if (!response.success) {
      return response as ApiResponse<TrajetEnCoursDto>;
    }

    return {
      ...response,
      data: normalizeLivePayload(response.data),
    };
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
