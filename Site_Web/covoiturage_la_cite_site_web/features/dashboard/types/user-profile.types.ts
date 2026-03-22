// ============================================================
//  TYPE COMMUN — Profil utilisateur (conducteur ou passager)
// ============================================================

/**
 * Structure de base partagée par Driver et Passenger.
 * Les deux rôles exposent exactement les mêmes champs dans l'interface.
 */
export interface UserProfile {
  id: string;
  pictureUrl: string;
  name: string;
  rating: number;
  tripsCount: number;
}
