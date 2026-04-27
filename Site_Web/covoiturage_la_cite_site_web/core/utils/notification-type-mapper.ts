/**
 * notification-type-mapper.ts
 *
 * Convertit les types PascalCase du Server Core (.NET NotificationType enum)
 * vers les types snake_case attendus par NotificationModel (frontend).
 *
 * Problème : Server Core renvoie "ReservationReceived", "TripCompleted", etc.
 * Le frontend attend  "reservation_received", "trip_completed", etc.
 * Sans ce mapping : icônes génériques, thèmes couleur faux, IMPORTANT_NOTIFICATION_TYPES
 * ne matche rien → zéro alerte critique.
 */

import type { NotificationType } from '@/core/models/NotificationModel';

const SERVER_TO_CLIENT_TYPE: Record<string, NotificationType> = {
  // Réservations
  ReservationReceived:   'reservation_received',
  ReservationAccepted:   'reservation_accepted',
  ReservationRefused:    'reservation_refused',
  ReservationCancelled:  'reservation_cancelled',
  // Trajets
  TripReminder:          'trip_starting_soon',
  TripStartingSoon:      'trip_starting_soon',
  TripStarted:           'trip_started',
  TripCompleted:         'trip_completed',
  TripCancelled:         'trip_cancelled',
  // Social
  NewReview:             'new_review_received',
  // Finance
  PenaltyApplied:        'cancellation_penalty',
  // Sécurité
  SystemAlert:           'security_alert',
  SosAlert:              'security_alert',
  // Gamification — pas de type dédié frontend → system
  BadgeEarned:           'system',
  ChallengeCompleted:    'system',
  GoTaskCompleted:       'system',
  GoScoreMilestone:      'system',
  RecommendedTrip:       'system',
  // Onboarding
  Welcome:               'system',
  HowItWorks:            'system',
  DocumentValidated:     'system',
  PaymentProcessed:      'system',
  Suggestion:            'system',
  System:                'system',
};

/**
 * Mappe un type Server Core vers le type frontend correspondant.
 * Supporte à la fois PascalCase et snake_case (double-compat).
 */
export function mapNotificationType(serverType: string): NotificationType {
  if (!serverType) return 'system';

  // 1. Lookup direct PascalCase → snake_case
  const mapped = SERVER_TO_CLIENT_TYPE[serverType];
  if (mapped) return mapped;

  // 2. Déjà en snake_case (vient du client ou d'un ancien format)
  const validSnake = Object.values(SERVER_TO_CLIENT_TYPE);
  if (validSnake.includes(serverType as NotificationType)) {
    return serverType as NotificationType;
  }

  // 3. Fallback
  return 'system';
}

/**
 * Mappe un objet notification brut du Server Core vers NotificationModel.
 * Handles : type, deepLink → link, body → message.
 */
export function mapServerNotification(raw: Record<string, unknown>): import('@/core/models/NotificationModel').NotificationModel {
  return {
    id:           String(raw.id ?? ''),
    userId:       String(raw.userId ?? ''),
    type:         mapNotificationType(String(raw.type ?? '')),
    title:        String(raw.title ?? ''),
    message:      String(raw.body ?? raw.message ?? ''),
    isRead:       Boolean(raw.isRead ?? false),
    isImportant:  Boolean(raw.isImportant ?? false),
    link:         raw.deepLink ? String(raw.deepLink) : raw.link ? String(raw.link) : undefined,
    relatedTripId:        raw.relatedTripId ? String(raw.relatedTripId) : undefined,
    relatedReservationId: raw.relatedReservationId ? String(raw.relatedReservationId) : undefined,
    createdAt:    String(raw.createdAt ?? new Date().toISOString()),
  };
}
