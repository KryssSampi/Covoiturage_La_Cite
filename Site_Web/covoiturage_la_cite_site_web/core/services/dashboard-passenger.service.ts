import { persistenceManager } from '@/tests/PersistenceManager';
import type { TripModel }         from '@/core/models/TripModel';
import type { ReservationModel }  from '@/core/models/ReservationModel';
import type { NotificationModel } from '@/core/models/NotificationModel';
import type { ReviewModel }       from '@/core/models/ReviewModel';
import type { UserModel }         from '@/core/models/UserModel';
import {
  tripModelToReservation,
  notificationModelToNotification,
  reviewModelToReview,
} from '@/features/dashboard/converters/dashboard.converter';

export type PassengerDashboardResult = {
  reservations:  ReturnType<typeof tripModelToReservation>[];
  notifications: ReturnType<typeof notificationModelToNotification>[];
  reviews:       ReturnType<typeof reviewModelToReview>[];
  stats: {
    tripsCount:    number;
    co2SavedKg:    number;
    averageRating: number;
    goScore:       number;
  };
};

export function buildPassengerDashboard(passengerId: string): PassengerDashboardResult | null {
  const allTrips   = persistenceManager.readAll<TripModel>('trips');
  const allRsv     = persistenceManager.readAll<ReservationModel>('reservations');
  const allNotifs  = persistenceManager.readAll<NotificationModel>('notifications');
  const allReviews = persistenceManager.readAll<ReviewModel>('reviews');
  const allUsers   = persistenceManager.readAll<UserModel>('users');

  const usersMap  = new Map(allUsers.map((u) => [u.id, u]));
  const passenger = usersMap.get(passengerId);
  if (!passenger) return null;

  // ── Réservations ──────────────────────────────────────────────────────────
  const reservations = allRsv
    .filter((r) => r.passengerId === passengerId)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
    .flatMap((r) => {
      const trip   = allTrips.find((t) => t.id === r.tripId);
      const driver = usersMap.get(r.driverId);
      if (!trip || !driver) return [];
      return [tripModelToReservation(trip, r, driver)];
    });

  // ── Notifications ─────────────────────────────────────────────────────────
  const notifications = allNotifs
    .filter((n) => n.userId === passengerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(notificationModelToNotification);

  // ── Avis reçus ───────────────────────────────────────────────────────────
  const reviews = allReviews
    .filter((r) => r.revieweeId === passengerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => reviewModelToReview(r, usersMap.get(r.reviewerId)));

  // ── Statistiques ─────────────────────────────────────────────────────────
  const completedTrips = allRsv
    .filter((r) => r.passengerId === passengerId && r.status === 'completed')
    .flatMap((r) => {
      const t = allTrips.find((trip) => trip.id === r.tripId);
      return t ? [t] : [];
    });

  const totalCo2 = completedTrips.reduce((sum, t) => sum + (t.co2SavedKg ?? 0), 0);

  const stats = {
    tripsCount:    passenger.passengerProfile?.totalTripsAsPassenger ?? completedTrips.length,
    co2SavedKg:    parseFloat((passenger.passengerProfile?.co2SavedKg ?? totalCo2).toFixed(1)),
    averageRating: passenger.passengerProfile?.averageRating ?? 0,
    goScore:       passenger.goScore ?? 0,
  };

  return { reservations, notifications, reviews, stats };
}
