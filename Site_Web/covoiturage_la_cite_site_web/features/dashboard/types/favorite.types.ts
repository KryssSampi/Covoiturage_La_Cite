/**
 * @file favorite.types.ts
 * @description Types et interfaces pour le système de favoris du dashboard.
 * Utilisé par FavoritesSection et useFavorites.
 */

// ─── Interface principale ────────────────────────────────────────────────────

/**
 * Représente un lieu favori enregistré par l'utilisateur.
 * Les favoris "Domicile" et "Travail" ont un traitement visuel prioritaire.
 */
export interface Favorite {
  /** Identifiant unique du favori (UUID côté API) */
  id: number;
  /** Nom affiché (ex: "Domicile", "Travail", "Gatineau") */
  name: string;
  /** Adresse complète utilisée pour l'autocomplétion de recherche */
  value: string;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

/**
 * Noms réservés qui bénéficient d'un icône et d'un ordre d'affichage spécifiques.
 */
export const PRIORITY_FAVORITE_NAMES = ["Domicile", "Travail"] as const;

/**
 * Adresse fixe du Collège La Cité — toujours affiché en premier dans les favoris.
 */
export const COLLEGE_LACITE_ADDRESS =
  "801, promenade de l'Aviation K1K 4R3, Ontario, Ottawa, Canada";
