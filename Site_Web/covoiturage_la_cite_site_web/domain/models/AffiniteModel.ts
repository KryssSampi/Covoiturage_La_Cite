/* ─────────────────────────────────────────────────────────────────────────── */
/* domain/models/AffiniteModel.ts                                              */
/* Modèle de persistance pour le système d'affinité entre utilisateurs.        */
/* ─────────────────────────────────────────────────────────────────────────── */

/**
 * AffiniteModel — Modèle de base de données pour l'affinité entre deux utilisateurs.
 *
 * Le score d'affinité augmente de +1 à chaque trajet complété ensemble
 * sans litige déclaré entre les deux parties.
 *
 * Ce modèle est bidirectionnel : la paire (userId1, userId2) est stockée
 * en ordre croissant d'ID pour éviter les doublons.
 */
export class AffiniteModel {
  /** Identifiant unique de l'entrée d'affinité */
  id: string = '';

  /** ID de l'utilisateur qui a mis l'autre en favoris (celui qui initie la relation) */
  idPersonneQuiAMisEnFavoris: string = '';

  /** ID de l'utilisateur qui a été mis en favoris */
  idPersonneEnFavoris: string = '';

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
