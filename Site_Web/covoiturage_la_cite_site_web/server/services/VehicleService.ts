/**
 * server/services/VehicleService.ts — Délégation Véhicules vers Server Core
 *
 * Endpoints : api/vehicles/*
 */

import { get, post, put, patch, del, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CreateVehiculeDto {
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  maxSeats: number;
  photoUrl?: string;
}

export type UpdateVehiculeDto = Partial<CreateVehiculeDto>;

export interface VehiculeResponseDto {
  id: string;
  driverProfileId: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  maxSeats: number;
  photoUrl?: string;
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const VehicleService = {

  /** Mes véhicules */
  async getMyVehicles(options?: RequestOptions): Promise<ApiResponse<VehiculeResponseDto[]>> {
    return get<VehiculeResponseDto[]>('api/vehicles', options);
  },

  /** Créer un véhicule */
  async create(data: CreateVehiculeDto, options?: RequestOptions): Promise<ApiResponse<VehiculeResponseDto>> {
    return post<VehiculeResponseDto>('api/vehicles', data, options);
  },

  /** Modifier un véhicule */
  async update(vehicleId: string, data: UpdateVehiculeDto, options?: RequestOptions): Promise<ApiResponse<VehiculeResponseDto>> {
    return put<VehiculeResponseDto>(`api/vehicles/${vehicleId}`, data, options);
  },

  /** Définir comme véhicule par défaut */
  async setDefault(vehicleId: string, options?: RequestOptions): Promise<ApiResponse> {
    return patch(`api/vehicles/${vehicleId}/set-default`, undefined, options);
  },

  /** Désactiver (soft delete) */
  async deactivate(vehicleId: string, options?: RequestOptions): Promise<ApiResponse> {
    return del(`api/vehicles/${vehicleId}`, options);
  },
};
