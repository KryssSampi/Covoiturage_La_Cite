/**
 * Types de la feature Favoris.
 * Lieux favoris, utilisateurs favoris, et alertes de trajets.
 */

// ─── Lieu Favori ─────────────────────────────────────────────────────────────

export interface LieuFavori {
  id: string;
  label: string;
  adresse: string;
  coordonnees: { lat: number; lng: number };
  isPrincipal: boolean;
  icon: LieuFavoriTag;
  nbTrajets: number;
  tagCouleur?: string;
}

export type LieuFavoriTag = "campus" | "domicile" | "travail" | "autre";

// ─── Utilisateur Favori ──────────────────────────────────────────────────────

export interface UtilisateurFavori {
  id: string;
  nomComplet: string;
  initiales: string;
  role: "conducteur" | "passager";
  note: number;
  nbTrajetsEnsemble: number;
  nbTrajetsEnsembleMois: number;
  badges: string[];
  niveau: string;
  estEnLigne: boolean;
  alerteActive: boolean;
  avatarGradient: string;
}

// ─── Alerte Trajet ───────────────────────────────────────────────────────────

export type AlerteStatut = "actif" | "en_attente" | "desactive";

export interface AlerteTrajet {
  id: string;
  lieuDepartId: string;
  lieuArriveeId: string;
  lieuDepartLabel: string;
  lieuArriveeLabel: string;
  joursActifs: string[];
  heureMin: string;
  heureMax: string;
  favorisUniquement: boolean;
  noteMinimale: number;
  prixMax?: number;
  statut: AlerteStatut;
  derniereCorrespondance?: string;
}

// ─── Onglet & Page Model ─────────────────────────────────────────────────────

export type OngletFavoris = "lieux" | "utilisateurs" | "alertes";

export interface FavorisStats {
  totalLieux: number;
  totalTrajets: number;
  distanceMoyenneKm: number;
  tempsMoyenMin: number;
}

export interface FavorisPageModel {
  utilisateurId: string;
  lieux: LieuFavori[];
  conducteursFavoris: UtilisateurFavori[];
  passagersFavoris: UtilisateurFavori[];
  alertes: AlerteTrajet[];
  ongletActif: OngletFavoris;
  stats: FavorisStats;
}

// ─── Résultat de recherche utilisateur (overlay) ─────────────────────────────

export interface UserSearchResult {
  id: string;
  name: string;
  role: string;
  note: string;
  badge: string;
  initiales: string;
  gradient: string;
}
