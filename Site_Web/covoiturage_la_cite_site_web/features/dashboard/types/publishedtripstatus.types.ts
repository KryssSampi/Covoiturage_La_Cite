/**
 * Statuts possibles d'un trajet publié.
 * Chaque statut détermine la couleur du badge et les actions disponibles.
 * Aligné sur §3.3 du manifeste (Gestion des Trajets).
 */
export enum PublishedTripStatus {
  /** Places disponibles, ouvert aux réservations */
  Published  = "published",
  /** Toutes les places sont occupées */
  Full       = "full",
  /** Trajet confirmé avec passagers */
  Confirmed  = "confirmed",
  /** Trajet en cours (GPS actif — voir §6 Géolocalisation) */
  InProgress = "in-progress",
  /** Trajet terminé avec succès */
  Completed  = "completed",
  /** Trajet annulé par le conducteur ou le système */
  Cancelled  = "cancelled",
  /** Conducteur ne s'est pas présenté (pénalité automatique §21) */
  NoShow     = "no-show",
}
