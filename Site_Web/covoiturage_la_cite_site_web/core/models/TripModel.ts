/**
 * TripModel — Modèle unifié pour les trajets
 * Fusion de : TrajetModel (domain), Trip (dashboard), PublishedTrip (dashboard),
 *             Trip (trajets/create), Ride (planner), TrajetEnCoursData (trajet-en-cours),
 *             DraftTrip (brouillons)
 *
 * Ce modèle est la SOURCE UNIQUE DE VÉRITÉ pour toute entité trajet dans l'application.
 * Les composants consomment ce modèle via leurs propres convertisseurs.
 */

// ─── Statuts du cycle de vie ──────────────────────────────────────────────────

/** Statut complet du cycle de vie d'un trajet */
export type TripLifecycleStatus =
  | 'draft'         // Brouillon (non publié)
  | 'published'     // Publié, recherchable par les passagers
  | 'full'          // Complet, toutes les places prises
  | 'confirmed'     // Confirmé, départ imminent (passagers et conducteur ont validé)
  | 'in_progress'   // En cours (trajet démarré)
  | 'completed'     // Terminé avec succès
  | 'cancelled'     // Annulé
  | 'no_show';      // Passager(s) non présentés

/** Type de départ */
export type DepartureType = 'immediate' | 'soon' | 'planned';

/** Type de trajet */
export type TripType = 'unique' | 'recurrent';

/** Mode de paiement accepté */
export type PaymentMethod = 'cash' | 'interac';

// ─── Sous-types ───────────────────────────────────────────────────────────────

/** Point géographique (lat/lng) */
export interface GeoPoint {
  lat: number;
  lng: number;
}

/** Lieu de départ ou d'arrivée d'un trajet */
export interface TripLocation {
  /** Nom court du lieu, ex: "Campus La Cité" */
  label: string;
  /** Adresse complète */
  fullAddress: string;
  /** Coordonnées géographiques */
  coordinates: GeoPoint;
  /** Instructions de rendez-vous, ex: "Devant l'entrée principale" */
  instructions?: string;
}

/** Point intermédiaire (waypoint) sur un trajet */
export interface TripWaypoint {
  order: number;
  location: TripLocation;
  /** Heure estimée de passage au format "HH:mm" */
  estimatedTime?: string;
}

/** Préférences du conducteur pour le trajet */
export interface TripPreferences {
  baggageAllowed: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  musicAllowed: boolean;
  flexibleItinerary: boolean;
  /** Niveau de conversation souhaité */
  conversationLevel: 'quiet' | 'moderate' | 'chatty';
  /** Note personnelle du conducteur aux passagers */
  driverNote?: string;
}

// ─── Modèle principal ─────────────────────────────────────────────────────────

/**
 * TripModel — Modèle principal pour tout trajet
 * Reflète une table "trajets" dans la base de données
 */
export interface TripModel {
  // ── Identité ──────────────────────────────────────────────────────────────
  /** Identifiant unique, ex: "TRJ-2026-08842" */
  id: string;

  // ── Relations ─────────────────────────────────────────────────────────────
  /** ID du conducteur (UserModel) */
  driverId: string;
  /** ID du véhicule (VehicleModel) */
  vehicleId: string;
  /** IDs des passagers avec réservation confirmée */
  passengerIds: string[];

  // ── Itinéraire ────────────────────────────────────────────────────────────
  departure: TripLocation;
  arrival: TripLocation;
  /** Points intermédiaires optionnels */
  waypoints: TripWaypoint[];
  /**
   * Polyline de l'itinéraire au format [[lat, lng], ...]
   * Générée par OSRM lors de la création
   */
  polyline: [number, number][];

  // ── Dates & heures ────────────────────────────────────────────────────────
  /** Date de départ au format ISO "YYYY-MM-DD" */
  departureDate: string;
  /** Heure de départ au format "HH:mm" */
  departureTime: string;
  /** Heure d'arrivée estimée au format "HH:mm" */
  estimatedArrivalTime?: string;

  // ── Capacité & prix ───────────────────────────────────────────────────────
  /** Nombre maximum de passagers (places offertes, conducteur exclu) */
  maxPassengers: number;
  /** Nombre actuel de passagers confirmés */
  currentPassengers: number;
  /** Prix par passager fixé par le conducteur (en CAD) */
  pricePerPassenger: number;
  /**
   * Prix affiché au passager = pricePerPassenger × 1.15 (frais de service 15 %)
   * Calculé automatiquement à la création du trajet.
   * Toutes les vues passager doivent afficher ce prix, jamais pricePerPassenger.
   */
  passengerPrice: number;
  paymentMethod: PaymentMethod;

  // ── Statut & cycle de vie ─────────────────────────────────────────────────
  status: TripLifecycleStatus;
  departureType: DepartureType;

  // ── Configuration ─────────────────────────────────────────────────────────
  tripType: TripType;
  preferences: TripPreferences;
  /** Jours de récurrence (0=dim, 1=lun, ... 6=sam), si tripType === 'recurrent' */
  recurrenceDays?: number[];
  /** Date de fin de récurrence, format "YYYY-MM-DD" */
  recurrenceEndDate?: string;

  // ── Critères matching v4 ──────────────────────────────────────────────────
  /** GoScore minimum requis du passager (0 = aucun) */
  minPassengerGoScore?: number;
  /** Langue préférée dans ce trajet */
  languagePreference?: 'fr' | 'en' | 'bilingual' | 'any';
  /** Niveau de bagages maximum accepté dans le véhicule */
  maxBaggageLevel?: 'none' | 'light' | 'heavy';

  // ── Statistiques calculées ─────────────────────────────────────────────────
  estimatedDistanceKm?: number;
  estimatedDurationMinutes?: number;
  /** Durée estimée du trajet en minutes, issue de la recherche conducteur lors de la création */
  durationEstimation?: number;
  /** Économie de CO2 estimée en kg */
  co2SavedKg?: number;

  // ── Metadata ──────────────────────────────────────────────────────────────
  createdAt: string;
  updatedAt: string;
  /** Note privée du conducteur (non visible aux passagers) */
  notes?: string;
}

// ─── Valeurs par défaut ───────────────────────────────────────────────────────

export const DEFAULT_TRIP_PREFERENCES: TripPreferences = {
  baggageAllowed: true,
  petsAllowed: false,
  smokingAllowed: false,
  musicAllowed: true,
  flexibleItinerary: false,
  conversationLevel: 'moderate',
  driverNote: undefined,
};
