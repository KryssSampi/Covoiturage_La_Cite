// ============================================================
//  TYPES — PublishedTripView
// ============================================================

import { TripPreferences, TripType, PaymentMethod } from './trip.create.types';

export type ReservationStatus =
  | 'none'        // aucune demande
  | 'pending'     // en attente de confirmation
  | 'confirmed'   // acceptée → peut suivre
  | 'refused'     // refusée (cooldown 24h)
  | 'cancelled';  // annulée

export type ViewerRole = 'passenger' | 'driver_owner' | 'admin';

// ── Conducteur affiché ────────────────────────────────────
export interface TripDriver {
  id: string;
  firstName: string;
  avatarUrl?: string;
  rating: number;       // ex: 4.5
  tripCount: number;    // ex: 40
}

// ── Véhicule affiché ──────────────────────────────────────
export interface TripVehicle {
  label: string;        // ex: "Honda Civic 2020"
  color: string;        // ex: "Noire"
  imageUrl?: string;
}

// ── Point (départ ou arrivée) ─────────────────────────────
export interface TripPoint {
  label: string;        // nom court affiché
  fullAddress: string;  // adresse complète
  instructions?: string;
  mapPreviewUrl?: string;
  /** Latitude du point — utilisée pour la mini-carte Leaflet */
  lat?: number;
  /** Longitude du point — utilisée pour la mini-carte Leaflet */
  lng?: number;
}

// ── Préférences ───────────────────────────────────────────
// Extends TripPreferences (trip.create.types) — seul driverNote est ajouté
export interface TripPreferencesView extends TripPreferences {
  driverNote?: string;  // message aux passagers
}

// ── Statut ────────────────────────────────────────────────
export interface TripStatusInfo {
  tripType: TripType;
  isRecurrent: boolean;
  maxDetourMinutes?: number;
  lastUpdatedAt: string; // ISO
}

// ── Vue complète du trajet publié ─────────────────────────
export interface PublishedTripViewData {
  id: string;
  driver: TripDriver;
  vehicle: TripVehicle;
  departure: TripPoint;
  arrival: TripPoint;
  pricePerPassenger: number;
  departureDate: string;    // ex: "Aujourd'hui"
  departureTime: string;    // ex: "03h30"
  estimatedDuration: number; // minutes
  estimatedDistance: number; // km
  availableSeats: number;
  totalSeats: number;
  preferences: TripPreferencesView;
  status: TripStatusInfo;
  paymentMethod: PaymentMethod;
  /** Polyline OSRM du trajet sous forme de tableau [lat, lng] (format Leaflet) */
  latLngs?: [number, number][];
}

// ── État du bouton réserver ───────────────────────────────
export type ReserveButtonState =
  | { kind: 'reserve' }
  | { kind: 'pending' }
  | { kind: 'confirmed' }
  | { kind: 'refused'; refusedAt: string }   // refusedAt ISO
  | { kind: 'cooldown'; hoursLeft: number }
  | { kind: 'full' }
  | { kind: 'manage' }    // driver_owner
  | { kind: 'readonly' }  // admin
  // ── États contextuels (arrivée depuis une carte) ───────
  | { kind: 'reservation-confirmed' }    // Réservation confirmée
  | { kind: 'reservation-inprogress' }   // Réservation en cours
  | { kind: 'reservation-cancelled' }    // Réservation annulée
  | { kind: 'reservation-pending' }      // Réservation rejetée
  | { kind: 'reservation-completed' }    // Réservation terminée
  | { kind: 'reservation-rejected' }     // Réservation rejetée
  | { kind: 'reservation-imminent' }     // Réservation imminente — bouton Démarrer
  | { kind: 'trip-published' }           // Trajet publié
  | { kind: 'trip-full' }               // Trajet plein
  | { kind: 'trip-confirmed' }          // Trajet confirmé
  | { kind: 'trip-inprogress' }         // Trajet en cours
  | { kind: 'trip-completed' }          // Trajet terminé
  | { kind: 'trip-cancelled' }          // Trajet annulé
  | { kind: 'trip-noshow' }             // Conducteur absent
  | { kind: 'trip-imminent' };           // Trajet imminent — bouton Démarrer le trajet

// ── Type source de la navigation ─────────────────────────
export type TripViewSource = 'reservation' | 'publishedtrip' | null;
