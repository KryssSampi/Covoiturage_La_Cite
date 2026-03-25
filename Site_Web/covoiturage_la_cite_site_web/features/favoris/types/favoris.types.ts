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
  tagCouleur?: string;
  /** Lieu ancré non supprimable (ex : Campus La Cité) */
  isAnchored?: boolean;
}

export type LieuFavoriTag = "campus" | "domicile" | "travail" | "autre";

// ─── Utilisateur Favori ──────────────────────────────────────────────────────

export interface UtilisateurFavori {
  id: string;
  /** ID de l'affinité associée — utile pour le CRUD */
  affiniteId: string;
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

// ─── Alerte Trajet (SurveyTrip catégorie alerte) ────────────────────────────

export type AlerteStatut = "actif" | "desactive";

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
  /** Le toggle de surveillance — contrôlé par l'utilisateur */
  surveyIsOn: boolean;
}

// ─── Onglet & Page Model ─────────────────────────────────────────────────────

/** Les sections de la page (plus de toggle — toutes visibles, scroll direct) */
export type SectionFavoris = "lieux" | "utilisateurs" | "alertes";

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

// ─── Réponse API consolidée ──────────────────────────────────────────────────

export interface FavorisApiResponse {
  lieux: LieuFavori[];
  utilisateursFavoris: UtilisateurFavori[];
  alertes: AlerteTrajet[];
  usersSearch: UserSearchResult[];
}

// ─── Callbacks CRUD passées en props à FavorisPage ───────────────────────────

export interface FavorisCallbacks {
  /** Ajouter un lieu favori */
  onAddLieu: (data: { adresse: string; pseudonyme: string; iconTag: string; coordonnees: { lat: number; lng: number } }) => Promise<{ ok: boolean }>;
  /** Supprimer un lieu favori */
  onDeleteLieu: (id: string) => Promise<{ ok: boolean }>;
  /** Ajouter un utilisateur en favori (crée/met à jour l'affinité) */
  onAddUserFavori: (targetUserId: string) => Promise<{ ok: boolean }>;
  /** Retirer un utilisateur des favoris */
  onDeleteUserFavori: (affiniteId: string) => Promise<{ ok: boolean }>;
  /** Toggle surveyIsOn sur une alerte */
  onToggleAlerte: (alerteId: string, newState: boolean) => Promise<{ ok: boolean }>;
  /** Supprimer une alerte */
  onDeleteAlerte: (alerteId: string) => Promise<{ ok: boolean }>;
}
