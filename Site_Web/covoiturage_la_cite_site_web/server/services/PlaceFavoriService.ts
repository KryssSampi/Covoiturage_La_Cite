/**
 * server/services/PlaceFavoriService.ts — Délégation PlacesFavoris → Server Core
 * Endpoints : api/places-favoris
 */

import { get, post, del, type ApiResponse, type RequestOptions } from '../http-client';

export interface PlaceFavoriResponseDto {
  id: string;
  pseudonyme: string;
  adresse: string;
  lat: number;
  lng: number;
  iconTag: string;
  isAnchored: boolean;
}

export interface CreatePlaceFavoriDto {
  pseudonyme: string;
  adresse: string;
  lat: number;
  lng: number;
  iconTag: string;
}

export const PlaceFavoriService = {
  getMyPlaces: (options?: RequestOptions): Promise<ApiResponse<PlaceFavoriResponseDto[]>> =>
    get<PlaceFavoriResponseDto[]>('api/places-favoris', options),

  create: (dto: CreatePlaceFavoriDto, options?: RequestOptions): Promise<ApiResponse<PlaceFavoriResponseDto>> =>
    post<PlaceFavoriResponseDto>('api/places-favoris', dto, options),

  delete: (placeId: string, options?: RequestOptions): Promise<ApiResponse<unknown>> =>
    del(`api/places-favoris/${placeId}`, options),
};
