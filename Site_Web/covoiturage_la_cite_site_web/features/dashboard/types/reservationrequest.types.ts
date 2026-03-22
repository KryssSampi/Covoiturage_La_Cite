import { Applicant } from "./applicant.types";

/**
 * Demande de réservation reçue par le conducteur.
 * Triée par note décroissante puis par date croissante (priorité aux mieux notés
 * pour les créneaux les plus proches).
 *
 * TODO: GET /api/driver/{userId}/reservation-requests?status=pending
 */
export interface ReservationRequest {
  /** Identifiant unique de la demande (ex: "RSV-2026-00001") */
  id: string;
  /** Passager demandeur */
  applicant: Applicant;
  /** Ville de départ du trajet concerné */
  departure: string;
  /** Ville d'arrivée du trajet concerné */
  destination: string;
  /** Date du trajet au format ISO "YYYY-MM-DD" */
  date: string;
  /** Heure du trajet "HH:mm" */
  time: string;
  /** Nombre maximal de passagers autorisés */
  maxPassengers: number;
  /** Nombre de passagers déjà confirmés */
  currentPassengers: number;
  /** Tarif par passager en CAD */
  price: number;
}

/**
 * Modèle de carte pour ReservationRequestCard.
 * Encapsule la demande + l'état UI d'expansion de la liste.
 */
export interface ReservationRequestCardModel {
  request: ReservationRequest;
  isPassengerListOpen: boolean;
}
