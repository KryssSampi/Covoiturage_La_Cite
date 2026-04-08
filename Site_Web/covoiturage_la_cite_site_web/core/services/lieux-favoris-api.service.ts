/**
 * core/services/lieux-favoris-api.service.ts
 * Pont BFF → Server Core pour les lieux favoris.
 * Remplace l'ancienne implémentation persistenceManager.
 */

import { PlaceFavoriService, type PlaceFavoriResponseDto } from '@/server/services/PlaceFavoriService';
import type { RequestOptions } from '@/server/http-client';
import type { LieuFavoriUnifie } from '@/shared/types/lieu-favori.types';
import { CAMPUS_LA_CITE } from '@/shared/fixtures/favoris.fixtures';

export type LieuFavoriRecord = {
  userId: string;
  pseudonyme: string;
  adresse: string;
  coordonnees: { lat: number; lng: number };
  iconTag: string;
  isAnchored?: boolean;
  id?: string;
};

function toUnifie(dto: PlaceFavoriResponseDto): LieuFavoriUnifie {
  return {
    id: dto.id,
    pseudonyme: dto.pseudonyme,
    adresse: dto.adresse,
    coordonnees: { lat: Number(dto.lat), lng: Number(dto.lng) },
    iconTag: dto.iconTag as LieuFavoriUnifie['iconTag'],
    isAnchored: dto.isAnchored,
    hasOffScreenButton: dto.isAnchored,
  };
}

export async function queryLieuxFavoris(
  _userId: string,
  options?: RequestOptions,
): Promise<LieuFavoriUnifie[]> {
  const result = await PlaceFavoriService.getMyPlaces(options);

  if (!result.success || !result.data) {
    // Fallback : retourner au moins le campus ancré
    return [CAMPUS_LA_CITE];
  }

  const places = result.data.map(toUnifie);

  const hasCampus = places.some((p) => p.isAnchored || p.iconTag === 'campus');
  const merged = hasCampus ? places : [CAMPUS_LA_CITE, ...places];

  return merged.sort((a, b) => {
    if (a.isAnchored && !b.isAnchored) return -1;
    if (!a.isAnchored && b.isAnchored) return 1;
    return 0;
  });
}

export async function saveLieuFavori(
  payload: LieuFavoriRecord,
  options?: RequestOptions,
): Promise<LieuFavoriRecord & { id: string }> {
  const result = await PlaceFavoriService.create(
    {
      pseudonyme: payload.pseudonyme,
      adresse: payload.adresse,
      lat: payload.coordonnees.lat,
      lng: payload.coordonnees.lng,
      iconTag: payload.iconTag,
    },
    options,
  );

  if (!result.success || !result.data) {
    throw new Error(result.message ?? 'Impossible de sauvegarder le lieu favori');
  }

  return {
    ...payload,
    id: result.data.id,
  };
}

export async function deleteLieuFavori(
  id: string,
  _userId: string,
  options?: RequestOptions,
): Promise<void> {
  const result = await PlaceFavoriService.delete(id, options);
  if (!result.success) {
    throw new Error(result.message ?? 'Impossible de supprimer le lieu favori');
  }
}
