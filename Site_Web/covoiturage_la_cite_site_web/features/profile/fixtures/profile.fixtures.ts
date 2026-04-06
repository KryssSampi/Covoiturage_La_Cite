/**
 * Fixtures pour les pages Profil Public et Configuration
 * Données de démonstration pour le rendu UI
 */

import type {
  UserPublic,
  DriverProfilePublic,
  PublicReview,
  PublicTrip,
  UsualTrip,
  MeData,
  UserPreferences,
} from "../types/profile.types";

// ── Fixtures Profil Public ────────────────────────────────────────────────────

export const mockDriverProfile: DriverProfilePublic = {
  validationStatus: "approved",
  averageRating: 4.8,
  totalTripsAsDriver: 142,
  co2SavedKg: 1600,
  vehiclePhotoUrl: "/img/avantages/ecologie.png",
  vehicleMake: "Renault",
  vehicleModel: "Captur",
  vehicleYear: 2021,
  vehicleColor: "blanc",
};

export const mockReviews: PublicReview[] = [
  {
    id: "1",
    reviewerName: "Marie L.",
    reviewerId: "user-1",
    reviewerAvatar: "/assets/placeholder/placeholer-profile-picture.png",
    rating: 5,
    comment: "Top !",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    reviewerName: "Pierre G.",
    reviewerId: "user-2",
    reviewerAvatar: "/assets/placeholder/placeholer-profile-picture.png",
    rating: 4,
    comment: "Sympa et ponctuel",
    createdAt: "2023-12-10",
  },
  {
    id: "3",
    reviewerName: "Léa D.",
    reviewerId: "user-3",
    reviewerAvatar: "/assets/placeholder/placeholer-profile-picture.png",
    rating: 5,
    comment: "Confortable !",
    createdAt: "2023-11-20",
  },
];

export const mockUsualTrips: UsualTrip[] = [
  { departureLabel: "Paris", arrivalLabel: "Rouen" },
  { departureLabel: "Paris", arrivalLabel: "Orléans" },
  { departureLabel: "Lille", arrivalLabel: "Paris D" },
];

export const mockPublishedTrips: PublicTrip[] = [
  {
    id: "trip-1",
    departureLabel: "Paris",
    arrivalLabel: "Lille",
    departureDate: "2024-02-15",
    departureTime: "07:00",
    availableSeats: 2,
    pricePerPassenger: 15,
  },
  {
    id: "trip-2",
    departureLabel: "Lille",
    arrivalLabel: "Paris",
    departureDate: "2024-02-15",
    departureTime: "18:00",
    availableSeats: 1,
    pricePerPassenger: 15,
  },
  {
    id: "trip-3",
    departureLabel: "Paris",
    arrivalLabel: "Lyon",
    departureDate: "2024-02-15",
    departureTime: "10:00",
    availableSeats: 3,
    pricePerPassenger: 30,
  },
];

export const mockUserPublic: UserPublic = {
  id: "user-123",
  firstName: "Julien",
  lastName: "Moreau",
  avatarUrl: "/assets/placeholder/placeholer-profile-picture.png",
  bio: "Conducteur passionné et éco-responsable depuis 2018. J'aime partager des trajets et rencontrer de nouvelles personnes. Ponctuel et véhicule propre ! 🚗🌿",
  isProfileVerified: true,
  canBeDriver: true,
  schoolRole: "etudiant",
  role: "driver",
  goScore: 480,
  languagesSpoken: ["fr", "en"],
  createdAt: "2018-09-01",
  likesCount: 142,
  isLikedByMe: false,
  isFavorite: false,
  driverProfile: mockDriverProfile,
  recentReviews: mockReviews,
  recentPublishedTrips: mockPublishedTrips,
  usualTrips: mockUsualTrips,
};

// ── Fixtures Configuration ────────────────────────────────────────────────────

export const mockPreferences: UserPreferences = {
  musicAccepted: true,
  petsAccepted: false,
  smokingAccepted: false,
  conversationLevel: "moderate",
  emailPrimordiales: true,
  emailSecondaires: true,
  emailNegligeables: false,
  pushPrimordiales: true,
  pushSecondaires: true,
  pushNegligeables: false,
};

export const mockMeData: MeData = {
  id: "user-123",
  firstName: "Julien",
  lastName: "Moreau",
  phone: "+1 613 555 0100",
  avatarUrl: "/assets/placeholder/placeholer-profile-picture.png",
  bio: "Conducteur passionné et éco-responsable depuis 2018. J'aime partager des trajets et rencontrer de nouvelles personnes. Ponctuel et véhicule propre ! 🚗",
  language: "fr",
  languagesSpoken: ["FR", "EN"],
  schoolRole: "etudiant",
  role: "driver",
  preferences: mockPreferences,
};

// ── Badges fixtures ───────────────────────────────────────────────────────────

export interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const mockBadges: Badge[] = [
  { id: "1", name: "Conducteur Expert", icon: "👨‍️", color: "bg-blue-100" },
  { id: "2", name: "Ponctuel", icon: "⏰", color: "bg-green-100" },
  { id: "3", name: "Eco-Friendly", icon: "🌿", color: "bg-emerald-100" },
  { id: "4", name: "Ambiance Sympa", icon: "😊", color: "bg-yellow-100" },
];
