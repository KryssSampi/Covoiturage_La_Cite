/**
 * @file tip.converter.ts
 * @description Convertit les AstuceResponseDto du Server Core en Tip pour le composant LaCiteAstucesSection.
 *
 * Architecture :
 * Server Core Astuce (MongoDB) → AstuceResponseDto (DTO) → Tip (type UI du composant)
 */

import type { Tip } from '@/features/dashboard/types/lacite_astuces.types';

/**
 * DTO retourné par le Server Core via ContentService.getAstuces()
 */
export interface AstuceResponseDto {
  id: string;
  externalId: string;
  imageUrl?: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
  order: number;
}

/**
 * Convertit un AstuceResponseDto en Tip (type UI du composant).
 * Mappe les noms de champs et fournit des valeurs par défaut.
 */
export function astuceResponseDtoToTip(dto: AstuceResponseDto): Tip {
  return {
    id: dto.externalId,
    src: dto.imageUrl ?? '',
    titlefr: dto.titleFr,
    titleen: dto.titleEn,
    descriptionfr: dto.descriptionFr,
    descriptionen: dto.descriptionEn,
  };
}

/**
 * Convertit un tableau d'AstuceResponseDto en tableau de Tip.
 */
export function astuceResponseDtosToTips(dtos: AstuceResponseDto[]): Tip[] {
  return dtos.map(astuceResponseDtoToTip);
}