/**
 * @file favorites.fixtures.ts
 * @description Données de test pour FavoritesSection.
 * ⚠️ DÉVELOPPEMENT UNIQUEMENT — À remplacer par un appel API.
 *
 * TODO: GET /api/users/{userId}/favorites
 */

import { Favorite } from "@/features/dashboard/types/favorite.types";

export const FIXTURE_FAVORITES: Favorite[] = [
  {
    id: 1,
    name: "Gatineau",
    value: "Gatineau, Quebec, Canada",
  },
  {
    id: 2,
    name: "Montreal",
    value: "Montreal, Quebec, Canada",
  },
  {
    id: 3,
    name: "Domicile",
    value: "250 rue de la paix, Gatineau, Quebec, Canada",
  },
  {
    id: 4,
    name: "Travail",
    value: "1000 boul Saint-Laurent, Montreal, Quebec, Canada",
  },
];
