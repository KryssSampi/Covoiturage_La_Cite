/**
 * server/services/ReservationService.ts — Délégation Réservations vers Server Core
 *
 * Endpoints : api/reservations/*, api/driver/reservation-requests, api/passenger/reservations-enriched
 */

import { get, post, patch, type ApiResponse, type RequestOptions } from '../http-client';
import type { PaginatedResult } from './UserService';

// ── Types (alignés sur ReservationDtos du Server Core) ────────────────────────

export interface CreateReservationDto {
  tripId: string;
  seatsRequested?: number;
  pickupNote?: string;
}

export interface ReservationResponseDto {
  id: string;
  tripId: string;
  passengerId: string;
  driverId: string;
  status: string;
  paymentStatus: string;
  seatsReserved: number;
  passengerPrice: number;
  driverAmount: number;
  platformFee: number;
  pickupNote?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  cancelledAt?: string;
}

export interface ReservationEnrichedDto extends Partial<ReservationResponseDto> {
  // Format nested (Server Core actuel)
  reservation?: ReservationResponseDto;
  trip?: {
    id: string;
    departureLabel?: string;
    arrivalLabel?: string;
    departureDate?: string;
    departureTime?: string;
    estimatedDurationMinutes?: number;
    maxPassengers?: number;
    currentPassengers?: number;
    pricePerPassenger?: number;
    status?: string;
  };
  passenger?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    averageRating?: number;
    totalTripsAsPassenger?: number;
  };
  driver?: {
    id: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    averageRating?: number;
    totalTripsAsDriver?: number;
  };

  // Format flat (retro-compat si endpoint legacy)
  id?: string;
  tripId?: string;
  passengerId?: string;
  seatsReserved?: number;
  passengerPrice?: number;
  passengerName?: string;
  passengerAvatarUrl?: string;
  tripDepartureAddress?: string;
  tripArrivalAddress?: string;
  tripDepartureDate?: string;
  tripDepartureLabel?: string;
  tripArrivalLabel?: string;
  tripDepartureTime?: string;
}

export interface ReservationDecisionRequest {
  reason?: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const ReservationService = {

  /** Créer une réservation */
  async create(data: CreateReservationDto, options?: RequestOptions): Promise<ApiResponse<ReservationResponseDto>> {
    return post<ReservationResponseDto>('api/reservations', data, options);
  },

  /** Obtenir une réservation par ID */
  async getById(reservationId: string, options?: RequestOptions): Promise<ApiResponse<ReservationResponseDto>> {
    return get<ReservationResponseDto>(`api/reservations/${reservationId}`, options);
  },

  /** Mes réservations (paginé) */
  async getMine(role?: string, page = 1, pageSize = 20, options?: RequestOptions): Promise<ApiResponse<PaginatedResult<ReservationResponseDto>>> {
    return get<PaginatedResult<ReservationResponseDto>>('api/reservations/mine', {
      ...options,
      params: { page, pageSize, ...(role ? { role } : {}), ...options?.params },
    });
  },

  /** Alias — liste des réservations */
  async getAll(role?: string, page = 1, pageSize = 20, options?: RequestOptions): Promise<ApiResponse<PaginatedResult<ReservationResponseDto>>> {
    return get<PaginatedResult<ReservationResponseDto>>('api/reservations', {
      ...options,
      params: { page, pageSize, ...(role ? { role } : {}), ...options?.params },
    });
  },

  /** Réservations actives */
  async getActive(options?: RequestOptions): Promise<ApiResponse<ReservationResponseDto[]>> {
    return get<ReservationResponseDto[]>('api/reservations/active', options);
  },

  /** Accepter une réservation */
  async accept(reservationId: string, options?: RequestOptions): Promise<ApiResponse<ReservationResponseDto>> {
    return post<ReservationResponseDto>(`api/reservations/${reservationId}/accept`, undefined, options);
  },

  /** Refuser une réservation */
  async refuse(reservationId: string, data?: ReservationDecisionRequest, options?: RequestOptions): Promise<ApiResponse<ReservationResponseDto>> {
    return post<ReservationResponseDto>(`api/reservations/${reservationId}/refuse`, data, options);
  },

  /** Annuler une réservation */
  async cancel(reservationId: string, data?: ReservationDecisionRequest, options?: RequestOptions): Promise<ApiResponse<ReservationResponseDto>> {
    return post<ReservationResponseDto>(`api/reservations/${reservationId}/cancel`, data, options);
  },

  /** Boarding confirmé par le conducteur */
  async boardingDriver(reservationId: string, options?: RequestOptions): Promise<ApiResponse<ReservationResponseDto>> {
    return patch<ReservationResponseDto>(`api/reservations/${reservationId}/boarding/driver`, undefined, options);
  },

  /** Boarding confirmé par le passager */
  async boardingPassenger(reservationId: string, options?: RequestOptions): Promise<ApiResponse<ReservationResponseDto>> {
    return patch<ReservationResponseDto>(`api/reservations/${reservationId}/boarding/passenger`, undefined, options);
  },

  /** Annuler toutes les réservations en cours */
  async cancelAll(options?: RequestOptions): Promise<ApiResponse> {
    return post('api/reservations/cancel-all', undefined, options);
  },

  /** Demandes de réservation reçues par le conducteur */
  async getDriverRequests(options?: RequestOptions): Promise<ApiResponse<ReservationEnrichedDto[]>> {
    return get<ReservationEnrichedDto[]>('api/driver/reservation-requests', options);
  },

  /** Réservations enrichies du passager */
  async getPassengerEnriched(passengerId?: string, options?: RequestOptions): Promise<ApiResponse<ReservationEnrichedDto[]>> {
    return get<ReservationEnrichedDto[]>('api/passenger/reservations-enriched', {
      ...options,
      params: { ...(passengerId ? { passengerId } : {}), ...options?.params },
    });
  },
};
