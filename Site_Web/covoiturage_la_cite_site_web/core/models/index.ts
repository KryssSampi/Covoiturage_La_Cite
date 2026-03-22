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
