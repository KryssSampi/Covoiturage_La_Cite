// ─────────────────────────────────────────────────────────────────────────────
// shared/types/lieu-favori.types.ts
// Type unifié pour les lieux favoris — utilisé par Dashboard, SuperSearch, Carte
// ─────────────────────────────────────────────────────────────────────────────

/** Tags d'icônes supportés — résolus en composants React par getLieuFavoriIcon() */
export type LieuFavoriIconTag =
  | 'campus'
  | 'domicile'
  | 'travail'
  | 'ecole'
  | 'ville'
  | 'autre';

/**
 * Lieu favori unifié — source unique pour tout le système de favoris.
 *
 * Utilisé par :
 * - FavoritesSection (dashboard) : affiche icône + pseudonyme, clic → autofill départ
 * - SuperSearchSection : menu déroulant favoris sur le champ arrivée
 * - TrajetMap : marqueurs favoris toujours visibles sur la carte
 * - Boutons off-screen : uniquement pour campus + domicile
 */
export interface LieuFavoriUnifie {
  /** Identifiant unique */
  id: string;
  /** Nom affiché (ex: "Campus La Cité", "Domicile") */
  pseudonyme: string;
  /** Adresse complète pour l'autocomplétion de recherche */
  adresse: string;
  /** Coordonnées GPS pour la carte et l'autofill */
  coordonnees: { lat: number; lng: number };
  /** Tag d'icône — résolu en composant React via getLieuFavoriIcon() */
  iconTag: LieuFavoriIconTag;
  /** Favori ancré = non-supprimable (Campus La Cité) */
  isAnchored?: boolean;
  /** Affiche un bouton off-screen sur la carte quand hors du viewport */
  hasOffScreenButton?: boolean;
}
