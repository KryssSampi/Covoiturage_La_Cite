// ─────────────────────────────────────────────────────────────────────────────
// shared/fixtures/favoris.fixtures.ts
// Source unique de vérité pour les lieux favoris
// Utilisé par Dashboard, SuperSearchSection, TrajetMap
// ─────────────────────────────────────────────────────────────────────────────
import type { LieuFavoriUnifie } from '../types/lieu-favori.types';

// ── Campus La Cité — favori ancré automatiquement ────────────────────────────
// Coordonnées exactes du Collège La Cité, 801 promenade de l'Aviation, Ottawa
export const CAMPUS_LA_CITE: LieuFavoriUnifie = {
  id: 'campus-la-cite',
  pseudonyme: 'Campus La Cité',
  adresse: '801, promenade de l\'Aviation K1K 4R3, Ontario, Ottawa, Canada',
  coordonnees: { lat: 45.4215, lng: -75.6830 },
  iconTag: 'campus',
  isAnchored: true,
  hasOffScreenButton: true,
};

// ── Fixture des lieux favoris par défaut ─────────────────────────────────────
// Campus La Cité est toujours inclus en premier (ancré).
// Les autres favoris sont des exemples de développement (TODO: GET /api/users/{userId}/favorites)
export const FIXTURE_LIEUX_FAVORIS: LieuFavoriUnifie[] = [
  CAMPUS_LA_CITE,
  {
    id: 'domicile',
    pseudonyme: 'Domicile',
    adresse: '250 rue de la paix, Gatineau, Quebec, Canada',
    coordonnees: { lat: 45.4380, lng: -75.7200 },
    iconTag: 'domicile',
    hasOffScreenButton: true,
  },
  {
    id: 'travail',
    pseudonyme: 'Travail',
    adresse: '1000 boul Saint-Laurent, Montreal, Quebec, Canada',
    coordonnees: { lat: 45.5088, lng: -73.5878 },
    iconTag: 'travail',
  },
  {
    id: 'gatineau',
    pseudonyme: 'Gatineau',
    adresse: 'Gatineau, Quebec, Canada',
    coordonnees: { lat: 45.4216, lng: -75.7006 },
    iconTag: 'ville',
  },
  {
    id: 'montreal',
    pseudonyme: 'Montreal',
    adresse: 'Montreal, Quebec, Canada',
    coordonnees: { lat: 45.5017, lng: -73.5673 },
    iconTag: 'ville',
  },
];
