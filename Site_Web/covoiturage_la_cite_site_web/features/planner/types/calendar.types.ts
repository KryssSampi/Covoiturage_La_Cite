// ─── ENUMS ────────────────────────────────────────────────────────────────────

/** Rôles disponibles dans l'application */
export const Role = {
  DRIVER:    "driver",
  PASSENGER: "passenger",
} as const;

/** Types de départ d'un trajet */
export const DepartureType = {
  Immediate: "immediate",  // < 15 min
  Soon:      "soon",       // 15 min – 1h
  Planned:   "planned",    // > 1h
} as const;

/** Statuts possibles d'un trajet publié (conducteur) */
export const PublishedTripStatus = {
  Published:  "published",
  Full:       "full",
  Confirmed:  "confirmed",
  InProgress: "inProgress",
  Completed:  "completed",
  Cancelled:  "cancelled",
  NoShow:     "noShow",
} as const;

/** Statuts possibles d'une réservation (passager) */
export const ReservationStatus = {
  Confirmed:  "confirmed",
  Pending:    "pending",
  Cancelled:  "cancelled",
  Completed:  "completed",
  InProgress: "inProgress",
} as const;

// ─── INTERFACES ───────────────────────────────────────────────────────────────

/** Représente un trajet avec ses informations essentielles */
export interface Ride {
  id:          string;
  date:        Date;
  start:       Date;
  end:         Date;
  origin:      string;
  destination: string;
  status:      string;
}

/** Représente une cellule de jour dans la grille mensuelle */
export interface MonthCell {
  day:     number;
  month:   number;
  year:    number;
  current: boolean;
}

/** Couleurs associées à un statut de trajet */
export interface StatusColors {
  bg:    string;
  text:  string;
  light: string;
}

/** Carte de correspondance statut → couleurs */
export type StatusColorsMap = Record<string, StatusColors>;

// ─── PROFIL MINIMAL ───────────────────────────────────────────────────────────

/**
 * Profil minimal d'un utilisateur tel qu'affiché dans les cartes de la rides.area.
 * Pensé pour être produit par un converter depuis le modèle UserModel du backend.
 */
export interface UserMiniProfile {
  id:         string;
  firstName:  string;
  avatarUrl?: string;
  /** Note moyenne sur 5 */
  rating:     number;
  totalRides: number;
  verified:   boolean;
}

// ─── VÉHICULE ─────────────────────────────────────────────────────────────────

/** Informations minimales d'un véhicule */
export interface VehicleInfo {
  make:   string;
  model:  string;
  color:  string;
  /** Nombre de places total (conducteur inclus) */
  seats:  number;
}

// ─── PRÉFÉRENCES TRAJET ──────────────────────────────────────────────────────

/** Préférences associées à un trajet */
export interface RidePreferences {
  music:        boolean;
  conversation: "silent" | "moderate" | "talkative";
  pets:         boolean;
  smoking:      boolean;
}

// ─── VUE CONDUCTEUR ───────────────────────────────────────────────────────────

/**
 * Demande de réservation reçue par le conducteur pour un de ses trajets.
 * Affiché dans la section "Demandes en attente" de la rides.area (conducteur).
 */
export interface RideRequest {
  id:               string;
  rideId:           string;
  passenger:        UserMiniProfile;
  /** Message optionnel laissé par le passager */
  message?:         string;
  requestedAt:      Date;
  /** Date/heure d'expiration automatique si le conducteur ne répond pas */
  expiresAt:        Date;
  /** Score de compatibilité passager ↔ trajet (0–100) */
  compatibilityPct: number;
  meetingPoint?:    string;
}

/**
 * Trajet enrichi vu du conducteur : inclut véhicule, places, prix et demandes.
 * Affiché dans la section "Prochains trajets" de la rides.area (conducteur).
 */
export interface DriverRide extends Ride {
  vehicle:             VehicleInfo;
  seatsTotal:          number;
  seatsAvailable:      number;
  pricePerSeat:        number;
  /** Demandes de réservation en attente pour ce trajet */
  pendingRequests:     RideRequest[];
  /** Passagers déjà confirmés */
  confirmedPassengers: UserMiniProfile[];
  meetingPoint?:       string;
  notes?:              string;
  preferences?:        RidePreferences;
  /** Type de départ selon les délais */
  departureType:       string;
}

// ─── VUE PASSAGER ─────────────────────────────────────────────────────────────

/**
 * Demande active émise par le passager vers un conducteur.
 * Affiché dans la section "Mes demandes" de la rides.area (passager).
 * Maximum 5 demandes simultanées.
 */
export interface PassengerRideRequest {
  id:               string;
  ride:             Ride;
  driver:           UserMiniProfile;
  vehicle:          VehicleInfo;
  pricePerSeat:     number;
  status:           string;   // utilise ReservationStatus
  requestedAt:      Date;
  /** Expiration automatique si le conducteur ne répond pas */
  expiresAt:        Date;
  meetingPoint?:    string;
  compatibilityPct: number;
  refusalReason?:   string;
}

/**
 * Réservation confirmée du passager.
 * Affiché dans la section "Réservations confirmées" de la rides.area (passager).
 */
export interface ConfirmedReservation {
  id:           string;
  ride:         Ride;
  driver:       UserMiniProfile;
  vehicle:      VehicleInfo;
  pricePerSeat: number;
  meetingPoint: string;
  status:       string;   // utilise ReservationStatus
  preferences?: RidePreferences;
}

// ─── INDISPONIBILITÉS ─────────────────────────────────────────────────────────

/** Représente une plage d'indisponibilité récurrente hebdomadaire */
export interface Indisponibility {
  /** Jour de la semaine anglais (ex: "Monday", "Friday") */
  weekday: string;
  /** Heure de début au format "HH:mm" */
  start:   string;
  /** Heure de fin au format "HH:mm" */
  end:     string;
}
