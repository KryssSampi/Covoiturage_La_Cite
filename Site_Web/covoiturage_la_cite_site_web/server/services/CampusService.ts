/**
 * server/services/CampusService.ts — Délégation Campus vers Server Core
 *
 * Endpoints : api/campus/zones/*, api/trips/{tripId}/waypoints/*
 */

import { get, post, put, del, type ApiResponse, type RequestOptions } from '../http-client';

// ── Types — Zones ─────────────────────────────────────────────────────────────

export interface GeofenceZoneResponseDto {
  id: string;
  name: string;
  description?: string;
  zoneType: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
  isActive: boolean;
}

export interface CreateGeofenceZoneDto {
  name: string;
  description?: string;
  zoneType: string;
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
}

export type UpdateGeofenceZoneDto = Partial<CreateGeofenceZoneDto>;

// ── Types — Waypoints ─────────────────────────────────────────────────────────

export interface WaypointResponseDto {
  id: string;
  tripId: string;
  label?: string;
  latitude: number;
  longitude: number;
  orderIndex: number;
}

export interface CreateWaypointDto {
  label?: string;
  latitude: number;
  longitude: number;
  orderIndex: number;
}

export interface ReorderWaypointDto {
  waypointId: string;
  newOrderIndex: number;
}

// ── Service ───────────────────────────────────────────────────────────────────

export const CampusZoneService = {

  /** Toutes les zones */
  async getAll(options?: RequestOptions): Promise<ApiResponse<GeofenceZoneResponseDto[]>> {
    return get<GeofenceZoneResponseDto[]>('api/campus/zones', options);
  },

  /** Zone par ID */
  async getById(zoneId: string, options?: RequestOptions): Promise<ApiResponse<GeofenceZoneResponseDto>> {
    return get<GeofenceZoneResponseDto>(`api/campus/zones/${zoneId}`, options);
  },

  /** Zones par type */
  async getByType(zoneType: string, options?: RequestOptions): Promise<ApiResponse<GeofenceZoneResponseDto[]>> {
    return get<GeofenceZoneResponseDto[]>(`api/campus/zones/type/${zoneType}`, options);
  },

  /** Zones à proximité */
  async getNearby(lat: number, lng: number, radiusKm: number, options?: RequestOptions): Promise<ApiResponse<GeofenceZoneResponseDto[]>> {
    return get<GeofenceZoneResponseDto[]>('api/campus/zones/nearby', {
      ...options,
      params: { lat, lng, radius: radiusKm, ...options?.params },
    });
  },

  /** Créer une zone (admin) */
  async create(data: CreateGeofenceZoneDto, options?: RequestOptions): Promise<ApiResponse<GeofenceZoneResponseDto>> {
    return post<GeofenceZoneResponseDto>('api/campus/zones', data, options);
  },

  /** Modifier une zone (admin) */
  async update(zoneId: string, data: UpdateGeofenceZoneDto, options?: RequestOptions): Promise<ApiResponse<GeofenceZoneResponseDto>> {
    return put<GeofenceZoneResponseDto>(`api/campus/zones/${zoneId}`, data, options);
  },

  /** Désactiver une zone (admin) */
  async deactivate(zoneId: string, options?: RequestOptions): Promise<ApiResponse> {
    return del(`api/campus/zones/${zoneId}`, options);
  },
};

export const WaypointService = {

  /** Waypoints d'un trajet */
  async getAll(tripId: string, options?: RequestOptions): Promise<ApiResponse<WaypointResponseDto[]>> {
    return get<WaypointResponseDto[]>(`api/trips/${tripId}/waypoints`, options);
  },

  /** Ajouter un waypoint */
  async add(tripId: string, data: CreateWaypointDto, options?: RequestOptions): Promise<ApiResponse<WaypointResponseDto>> {
    return post<WaypointResponseDto>(`api/trips/${tripId}/waypoints`, data, options);
  },

  /** Réordonner les waypoints */
  async reorder(tripId: string, data: ReorderWaypointDto[], options?: RequestOptions): Promise<ApiResponse<string>> {
    return put<string>(`api/trips/${tripId}/waypoints/reorder`, data, options);
  },

  /** Supprimer un waypoint */
  async delete(tripId: string, waypointId: string, options?: RequestOptions): Promise<ApiResponse> {
    return del(`api/trips/${tripId}/waypoints/${waypointId}`, options);
  },
};
