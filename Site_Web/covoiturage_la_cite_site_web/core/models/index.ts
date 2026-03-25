/**
 * index.ts — Point d'entrée unique pour tous les modèles unifiés
 *
 * Ces modèles sont la SOURCE UNIQUE DE VÉRITÉ du domaine.
 * Chaque feature utilise des convertisseurs pour passer du modèle à son type UI local.
 */

export type {
  TripModel,
  TripLifecycleStatus,
  TripType,
  PaymentMethod,
  DepartureType,
  GeoPoint,
  TripLocation,
  TripWaypoint,
  TripPreferences,
} from './TripModel';
export { DEFAULT_TRIP_PREFERENCES } from './TripModel';

export type {
  ReservationModel,
  ReservationLifecycleStatus,
} from './ReservationModel';

export type {
  UserModel,
  UserRole,
  ConversationLevel,
  DriverProfile,
  PassengerProfile,
  UserPreferences,
} from './UserModel';
export { DEFAULT_USER_PREFERENCES } from './UserModel';

export type { VehicleModel } from './VehicleModel';

export type {
  NotificationModel,
  NotificationType,
} from './NotificationModel';

export type {
  MessageModel,
  MessageType,
} from './MessageModel';

export type {
  ReviewModel,
  RevieweeRole,
} from './ReviewModel';

export type {
  BadgeModel,
  BadgeCategorie,
  BadgeIconKey,
} from './BadgeModel';

export type {
  UserStatModel,
  UserStatKpis,
  UserStatTrajets,
  UserStatCO2Mois,
  UserStatScatterPoint,
  UserStatNotesHebdo,
  UserStatDistributionNotes,
  UserStatTrajetResume,
  UserStatImpactEco,
  UserStatBadgeRef,
} from './UserStatModel';

export type {
  PassengerFinanceAccountModel,
  PassengerFinanceTransaction,
} from './PassengerFinanceAccountModel';

export type {
  UserPreferencesModel,
  ConversationLevelPref,
  BaggageLevel,
  LanguagePreference,
  PaymentMethodPref,
  MusicGenre,
} from './UserPreferencesModel';
export { DEFAULT_USER_PREFERENCES_EXTENDED } from './UserPreferencesModel';

export type {
  AffiniteModel,
  AffiniteRecord,
  AffiniteRatingEvent,
  OrigineRelation,
} from './AffiniteModel';
export { createAffiniteFromFirstTrip, computeAffiniteScore } from './AffiniteModel';

export type {
  SignalementModel,
  LitigeModel,
  LitigeEchange,
  CibleSignalement,
  NiveauSeverite,
  NiveauSecurite,
  StatutSignalement,
  StatutLitige,
  DecisionLitige,
  PartieLitige,
} from './SignalementModel';
