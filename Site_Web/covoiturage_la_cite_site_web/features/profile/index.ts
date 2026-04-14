/**
 * Barrel export pour le module profile
 */

// Components - Configuration
export { ProfileHeader } from "./components/ProfileHeader";
export { SettingsSidebar } from "./components/SettingsSidebar";

// Components - Public Profile
export {
  ProfileBanner,
  ProfileHeaderSection,
  ProfileBadgesSection,
  ProfileStatsSection,
  ProfileReviewsSection,
  ProfileRecurringTripsSection,
  ProfilePublishedTripsSection,
} from "./components/public-profile";

// Components - Shared
export { ProfileUsualTripCard } from "./components/ProfileUsualTripCard";
export { ProfileTripCard } from "./components/ProfileTripCard";

// Hooks
export { useProfileActions } from "./hooks/useProfileActions";

// Types
export * from "./types/profile.types";
