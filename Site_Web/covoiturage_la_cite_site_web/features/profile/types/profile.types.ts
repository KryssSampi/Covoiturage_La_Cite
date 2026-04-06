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

export type SettingsTab = "profile" | "settings";

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
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
  language: string;
  languagesSpoken: string[];
  schoolRole: string;
  role: string;
  preferences?: UserPreferences;
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
