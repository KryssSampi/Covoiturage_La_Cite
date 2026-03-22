/**
 * Candidat à une réservation (passager demandeur).
 * Partagé entre ReservationRequest et l'affichage conducteur.
 *
 * TODO: Sous-entité de GET /api/reservations/{reservationId} → applicant
 */
export interface Applicant {
  /** UUID de l'applicant */
  id: string;
  /** URL de la photo de profil */
  urlPicture: string;
  /** Prénom + nom affiché */
  name: string;
  /** Note moyenne sur 5 (utilisée pour le tri OrganizeRequest) */
  note: number;
  /** Nombre de trajets effectués */
  doneTrips: number;
}
