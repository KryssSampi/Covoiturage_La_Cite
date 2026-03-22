/**
 * VehicleModel — Modèle unifié pour les véhicules
 * Fusion de : VehiculeModel (domain), VehicleInfo (planner), TripVehicle (trajets)
 */
export interface VehicleModel {
  // ── Identité ──────────────────────────────────────────────────────────────
  id: string;

  // ── Relation ──────────────────────────────────────────────────────────────
  /** ID du propriétaire conducteur (UserModel) */
  driverId: string;

  // ── Informations véhicule ─────────────────────────────────────────────────
  make: string;             // marque, ex: "Honda"
  model: string;            // modèle, ex: "Civic"
  year: number;             // année, ex: 2021
  color: string;            // couleur, ex: "Gris anthracite"
  licensePlate: string;     // immatriculation, ex: "ABC 1234"
  maxSeats: number;         // places max (passagers), ex: 4

  // ── Ressources visuelles ──────────────────────────────────────────────────
  photoUrl?: string;

  // ── Statut ────────────────────────────────────────────────────────────────
  /** Véhicule actif (utilisé pour les trajets) */
  isActive: boolean;
  /** Véhicule validé par l'administration */
  isValidated: boolean;

  // ── Metadata ──────────────────────────────────────────────────────────────
  createdAt: string;
  updatedAt: string;
}
