// ============================================================
//  TYPES — CreateTrip (formulaire de creation de trajet)
// ============================================================

export type TripType = 'unique' | 'recurrent';
export type PaymentMethod = 'cash' | 'interac';
export type TripStatus = 'draft' | 'published' | 'in_progress' | 'completed' | 'cancelled';

// ── Preferences du trajet (toutes false par defaut) ──────────
export interface TripPreferences {
  baggageAllowed: boolean;
  petsAllowed: boolean;
  smokingAllowed: boolean;
  musicAllowed: boolean;
  flexibleItinerary: boolean;
}

// ── Modele Trip complet ───────────────────────────────────────
export interface Trip {
  // Champs obligatoires
  departureLocation: string;
  arrivalLocation: string;
  departureDate: string;   // YYYY-MM-DD
  departureTime: string;   // HH:mm
  vehicleId: string;

  // Champs avec valeurs par defaut
  tripType: TripType;
  maxPassengers: number;
  availableSeats: number;
  pricePerPassenger: number;
  paymentMethod: PaymentMethod;
  preferences: TripPreferences;
  status: TripStatus;

  // Champs optionnels
  id?: string;
  conductorId?: string;
  recurrenceDays?: number[];  // 0 = Dim … 6 = Sam, requis si recurrent
  recurrenceEndDate?: string;
  notes?: string;
  estimatedDistance?: number; // km
  estimatedDuration?: number; // minutes
  createdAt?: string;
  updatedAt?: string;
}

// ── Valeurs par defaut des preferences ───────────────────────
export const DEFAULT_TRIP_PREFERENCES: TripPreferences = {
  baggageAllowed: false,
  petsAllowed: false,
  smokingAllowed: false,
  musicAllowed: false,
  flexibleItinerary: false,
};

export type CreateTripFormState = Omit<Trip, 'id' | 'conductorId' | 'createdAt' | 'updatedAt'>;

// ── Etat initial du formulaire (valeurs par defaut) ───────────
export const DEFAULT_CREATE_TRIP_FORM: CreateTripFormState = {
  departureLocation: '',
  arrivalLocation: '',
  departureDate: '',
  departureTime: '',
  vehicleId: '',
  tripType: 'unique',
  maxPassengers: 4,
  availableSeats: 3,
  pricePerPassenger: 5,
  paymentMethod: 'cash',
  preferences: DEFAULT_TRIP_PREFERENCES,
  status: 'draft',
};

// ── Pre-remplissage depuis un circuit TripWay (bouton "Choisir ce circuit") ──
// Les coordonnées sont passées via l'URL ; la date/heure proviennent du TimeCell sélectionné.
export interface TripWayPrefill {
  departureLocation?: string;
  arrivalLocation?: string;
  departureDate?: string; // format "yyyy-MM-dd" depuis pendingDateTime
  departureTime?: string; // format "HH:MM"     depuis pendingDateTime
}
