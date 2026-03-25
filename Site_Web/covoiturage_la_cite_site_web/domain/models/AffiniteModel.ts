/* ─────────────────────────────────────────────────────────────────────────── */
/* domain/models/AffiniteModel.ts                                              */
/* Modèle de persistance pour le système d'affinité entre utilisateurs.        */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * AffiniteModel — Modèle de base de données pour l'affinité entre deux utilisateurs.
 *
 * L'affinité est créée dès le premier trajet complété ensemble et croît
 * de +1 à chaque trajet sans litige, indépendamment du statut favori.
 *
 * Pour apparaître dans la liste de favoris d'un utilisateur :
 *  1. L'utilisateur connecté doit être celui dans idPersonneQuiAMisEnFavoris
 *  2. isActuallyFavorite doit être true (mis manuellement par l'utilisateur)
 */
export class AffiniteModel {
  /** Identifiant unique de l'entrée d'affinité */
  id: string = '';

  /** ID de l'utilisateur qui a mis l'autre en favoris (celui qui initie la relation) */
  idPersonneQuiAMisEnFavoris: string = '';

  /** ID de l'utilisateur qui a été mis en favoris */
  idPersonneEnFavoris: string = '';

  /**
   * Indique si l'utilisateur a explicitement ajouté cette personne en favori.
   * L'affinité existe dès le premier trajet, mais n'apparaît dans les favoris
   * que lorsque isActuallyFavorite est true.
   */
  isActuallyFavorite: boolean = false;

  /**
   * Note d'affinité — grimpe de +1 à chaque trajet complété ensemble
   * sans litige déclaré entre les deux utilisateurs.
   */
  noteAffinite: number = 0;

  /** Nombre total de trajets effectués ensemble */
  totalTrajetsEnsemble: number = 0;

  /** Date du dernier trajet effectué ensemble (ISO 8601) */
  dernierTrajetDate: string = '';

  /** Date de création de la relation (ISO 8601) */
  createdAt: string = '';

  /** Date de dernière mise à jour (ISO 8601) */
  updatedAt: string = '';

  constructor(data?: Partial<AffiniteModel>) {
    if (data) Object.assign(this, data);
  }
}
