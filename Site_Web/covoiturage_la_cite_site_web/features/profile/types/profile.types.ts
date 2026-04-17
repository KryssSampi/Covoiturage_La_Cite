/**
 * Types partagés pour les pages Profil Public et Configuration
 */

// ── Types pour le profil public ───────────────────────────────────────────────

export interface DriverProfilePublic {
  validationStatus: string;
  averageRating: number;
  totalTripsAsDriver: number;
  co2SavedKg: number;
  vehiclePhotoUrl?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleColor?: string;
}

export interface PublicReview {
  id?: string;
  reviewerName: string;
  reviewerId?: string;
  reviewerAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface PublicTrip {
  id: string;
  departureLabel: string;
  arrivalLabel: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  pricePerPassenger: number;
}

export interface UsualTrip {
  departureLabel: string;
  arrivalLabel: string;
}

export interface UserPublic {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  isProfileVerified: boolean;
  canBeDriver: boolean;
  schoolRole: string;
  role: string;
  goScore: number;
  languagesSpoken: string[];
  createdAt: string;
  likesCount: number;
  isLikedByMe: boolean;
  isFavorite: boolean;
  driverProfile?: DriverProfilePublic;
  recentReviews: PublicReview[];
  recentPublishedTrips: PublicTrip[];
  usualTrips: UsualTrip[];
}

// ── Types pour la configuration ───────────────────────────────────────────────

export type SettingsTab =
  | "profile"
  | "settings"
  | "visibility"
  | "trip"
  | "notifications"
  | "privacy"
  | "search"
  | "vehicle"
  | "accessibility";

/**
 * Rôle à l'école - entièrement paramétrable et modifiable par l'utilisateur
 */
export type SchoolRoleEditable =
  | "etudiant"
  | "professeur"
  | "membredupersonnel"
  | "administrateur"
  | string;

/**
 * Rôle dans l'application - en lecture seule, affiché dans un label gris
 */
export type AppRole =
  | "driver"
  | "passenger"
  | "admin"
  | "moderator"
  | string;

export interface UserPreferences {
  musicAccepted: boolean;
  petsAccepted: boolean;
  smokingAccepted: boolean;
  conversationLevel: string;
  emailPrimordiales: boolean;
  emailSecondaires: boolean;
  emailNegligeables: boolean;
  pushPrimordiales: boolean;
  pushSecondaires: boolean;
  pushNegligeables: boolean;
}

export interface MeData {
  id: string;
  email?: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  notificationEmail?: string;
  language: string;
  languagesSpoken: string[];
  schoolRole: SchoolRoleEditable;
  role: AppRole;
  preferences?: UserPreferences;
}

// ── Visibilité du profil public ───────────────────────────────────────────────

export interface ProfileVisibility {
  goScore: boolean;
  tripsCount: boolean;
  globalRating: boolean;
  co2Saved: boolean;
}

// ── Préférences étendues (UserPreferencesModel) ───────────────────────────────

export type ConversationLevelPref = 'quiet' | 'moderate' | 'chatty';
export type BaggageLevel = 'none' | 'light' | 'heavy';
export type LanguagePreference = 'fr' | 'en' | 'bilingual';
export type PaymentMethodPref = 'cash' | 'interac';
export type MusicGenre =
  | 'pop' | 'rock' | 'rap' | 'rnb' | 'classique'
  | 'jazz' | 'electro' | 'country' | 'indifferent';

export interface ExtendedUserPreferences {
  // Comportement en trajet
  conversationLevel: ConversationLevelPref;
  musicAccepted: boolean;
  musicGenre?: MusicGenre;
  smokesRegularly: boolean;
  smokingAccepted: boolean;
  hasPets: boolean;
  petsAccepted: boolean;
  typicalBaggageLevel: BaggageLevel;

  // Paiement
  acceptedPaymentMethods: PaymentMethodPref[];
  preferredPaymentMethod?: PaymentMethodPref;

  // Langue
  languagePreference: LanguagePreference;

  // Recherche de trajet (passager)
  defaultDepartureRadiusMeters: number;
  defaultArrivalRadiusMeters: number;
  defaultTimeToleranceMinutes: number;
  defaultMaxPrice?: number;

  // Exigences de sécurité (passager)
  requireVerifiedDriver: boolean;
  minDriverGoScore: number;
  minDriverRating: number;

  // Exigences du conducteur
  minPassengerGoScore: number;
  baggagePolicy: BaggageLevel;
  requirePassengerMessage: boolean;

  // Notifications
  notifyNewMatchingTrips: boolean;
  notifyReservationUpdates: boolean;
  notifyMessages: boolean;
  notifyGoBoard: boolean;

  // Confidentialité
  showPhoneNumber: boolean;
  showLastName: boolean;
  allowAffinityTracking: boolean;
}

// ── Véhicule ──────────────────────────────────────────────────────────────────

/**
 * Champs de véhicule qui peuvent être rendus modifiables par un admin
 */
export type AdminEditableField = 'make' | 'model' | 'year' | 'color' | 'licensePlate' | 'maxSeats';

/**
 * Configuration des champs modifiables par admin pour un véhicule
 */
export interface AdminEditableConfig {
  /** Champs rendus modifiables par ordre admin */
  editableFields: AdminEditableField[];
  /** Message d'avertissement affiché sous les champs modifiables */
  warningMessage?: string;
}

export interface VehicleInfo {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  licensePlate: string;
  maxSeats: number;
  photoUrl?: string;
  isActive: boolean;
  isValidated: boolean;
  adminRequestDocuments?: boolean; // Si un admin a demandé des documents
  /** Configuration des champs modifiables par admin */
  adminEditableConfig?: AdminEditableConfig;
  /** Capacité standard du véhicule (selon standards du marché) */
  standardCapacity?: number;
  /** Catégories de documents requis pour ce véhicule */
  requiredDocumentCategories?: ('vehiclePhotos' | 'vehicleDocuments')[];
  /** Types de documents requis (sous-ensemble de REQUIRED_DOCUMENTS) */
  requiredDocumentTypes?: string[];
  /** Type de photo requis : interior, exterior, ou both */
  requiredPhotoType?: 'interior' | 'exterior' | 'both';
}

// ── Types pour les actions de profil ──────────────────────────────────────────

export interface UseProfileActionsReturn {
  handleLike: () => Promise<void>;
  handleFavorite: () => Promise<void>;
  handleSubscribe: (departure: string, arrival: string, driverName: string) => Promise<void>;
  handleReserve: (tripId: string) => void;
  likeLoading: boolean;
  favoriteLoading: boolean;
  subscribeLoading: Record<string, boolean>;
}
