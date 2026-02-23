/**
 * Trajet publié par le conducteur.
 * Affiché dans PublishedTripSection et PublishedTripCard.
 *
 * TODO: GET /api/driver/{userId}/trips?status=active&limit=10
 */
import { PublishedTripStatus } from "./publishedtripstatus.types";
import { Passenger } from "./passenger.types";

export interface PublishedTrip {
  /** Identifiant unique du trajet */
  id: number;
  /** Ville / adresse de départ */
  departure: string;
  /** Ville / adresse d'arrivée */
  destination: string;
  /** Date au format ISO "YYYY-MM-DD" ou ISO string complet */
  date: string;
  /** Heure de départ "HH:mm" */
  time: string;
  /** Capacité totale du véhicule - 1 (conducteur exclu) */
  maxPassengers: number;
  /** Liste des passagers confirmés */
  passengers: Passenger[];
  /** Tarif par passager en CAD */
  price: number;
  /** Nombre de demandes en attente d'acceptation */
  pendingRequests: number;
  /** Statut courant du trajet */
  status: PublishedTripStatus;
}

/**
 * Modèle de carte pour PublishedTripCard.
 * Encapsule le trajet + l'état UI d'expansion de la liste de passagers.
 */
export interface PublishedTripCardModel {
  trip: PublishedTrip;
  isPassengerListOpen: boolean;
}