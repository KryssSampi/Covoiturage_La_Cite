import type { FAQItemModel, FAQQuestion } from '@/domain/models/FAQItemModel';

export type { FAQItemModel, FAQQuestion };

export interface FAQActiveState {
  itemId:   string | null;
  question: FAQQuestion | null;
}

export interface FAQFilters {
  search:    string;
  categorie: string; // '' = Tous
}

export const FAQ_CATEGORIES = [
  'Compte',
  'Trajets',
  'Réservations',
  'Sécurité',
  'Données',
  'Paiements',
  'Technique',
  'Accessibilité',
] as const;

export type FAQCategory = typeof FAQ_CATEGORIES[number];
