import { persistenceManager } from '@/tests/PersistenceManager';
import type { TripModel } from '@/core/models/TripModel';
import type { ReservationModel } from '@/core/models/ReservationModel';
import type { NotificationModel } from '@/core/models/NotificationModel';
import type { ReviewModel } from '@/core/models/ReviewModel';
import type { UserModel } from '@/core/models/UserModel';
import {
  tripModelToPublishedTrip,
  reservationModelToRequest,
  notificationModelToNotification,
  reviewModelToReview,
} from '@/features/dashboard/converters/dashboard.converter';

export type DriverDashboardResult = {
  publishedTrips:       ReturnType<typeof tripModelToPublishedTrip>[];
  reservationRequests:  ReturnType<typeof reservationModelToRequest>[];
  notifications:        ReturnType<typeof notificationModelToNotification>[];
  reviews:              ReturnType<typeof reviewModelToReview>[];
  stats: {
    tripsCount:    number;
    co2SavedKg:    number;
    averageRating: number;
    goScore:       number;
  };
  finance: {
    soldeDisponible:     number;
    currency:            string;
    weeklyProfit:        number;
    weeklyPendingProfit: number;
    penalties:           number;
  };
};

export function buildDriverDashboard(driverId: string): DriverDashboardResult | null {
  const allTrips   = persistenceManager.readAll<TripModel>('trips');
  const allRsv     = persistenceManager.readAll<ReservationModel>('reservations');
  const allNotifs  = persistenceManager.readAll<NotificationModel>('notifications');
  const allReviews = persistenceManager.readAll<ReviewModel>('reviews');
  const allUsers   = persistenceManager.readAll<UserModel>('users');

  const usersMap = new Map(allUsers.map((u) => [u.id, u]));
  const driver   = usersMap.get(driverId);
  if (!driver) return null;

  // ── Trajets publiés + compteurs demandes en attente ──────────────────────────
  const driverTrips = allTrips.filter((t) => t.driverId === driverId);

  const pendingCountMap = new Map<string, number>();
  allRsv
    .filter((r) => r.status === 'pending' && r.driverId === driverId)
    .forEach((r) => {
      pendingCountMap.set(r.tripId, (pendingCountMap.get(r.tripId) ?? 0) + 1);
    });

  const publishedTrips = driverTrips
    .filter((t) => ['published', 'full', 'in_progress'].includes(t.status))
    .map((t) => {
      const passengers = t.passengerIds
        .map((pid) => usersMap.get(pid))
        .filter((u): u is UserModel => u !== undefined);
      return tripModelToPublishedTrip(t, passengers, pendingCountMap.get(t.id) ?? 0);
    });

  // ── Demandes en attente ───────────────────────────────────────────────────────
  const driverTripIds = new Set(driverTrips.map((t) => t.id));
  const reservationRequests = allRsv
    .filter((r) => r.status === 'pending' && driverTripIds.has(r.tripId))
    .flatMap((r) => {
      const trip      = allTrips.find((t) => t.id === r.tripId);
      const passenger = usersMap.get(r.passengerId);
      if (!trip || !passenger) return [];
      return [reservationModelToRequest(r, trip, passenger)];
    });

  // ── Notifications ─────────────────────────────────────────────────────────────
  const notifications = allNotifs
    .filter((n) => n.userId === driverId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(notificationModelToNotification);

  // ── Avis reçus ───────────────────────────────────────────────────────────────
  const reviews = allReviews
    .filter((r) => r.revieweeId === driverId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((r) => reviewModelToReview(r, usersMap.get(r.reviewerId)));

  // ── Statistiques ─────────────────────────────────────────────────────────────
  const totalCo2 = driverTrips
    .filter((t) => t.status === 'completed')
    .reduce((sum, t) => sum + (t.co2SavedKg ?? 0), 0);

  const stats = {
    tripsCount:    driver.driverProfile?.totalTripsAsDriver ?? driverTrips.filter((t) => t.status === 'completed').length,
    co2SavedKg:    parseFloat(totalCo2.toFixed(1)),
    averageRating: driver.driverProfile?.averageRating ?? 0,
    goScore:       driver.driverProfile?.reputationPoints ?? 0,
  };

  // ── Finance ───────────────────────────────────────────────────────────────────
  const completedRsv = allRsv.filter((r) => r.driverId === driverId && r.status === 'completed');
  const pendingRsv   = allRsv.filter((r) => r.driverId === driverId && r.status === 'in_progress');
  const now          = new Date();
  const startOfWeek  = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());

  const financeAccounts = persistenceManager.readAll<{ driverId: string; soldeDisponible: number }>('driver_finance_accounts');
  const financeAccount  = financeAccounts.find((a) => a.driverId === driverId);

  const weeklyProfit = completedRsv
    .filter((r) => r.completedAt && new Date(r.completedAt) >= startOfWeek)
    .reduce((sum, r) => sum + (r.totalAmount ?? 0), 0);

  const finance = {
    soldeDisponible:     parseFloat((financeAccount?.soldeDisponible ?? 0).toFixed(2)),
    currency:            'CAD',
    weeklyProfit:        parseFloat(weeklyProfit.toFixed(2)),
    weeklyPendingProfit: parseFloat(pendingRsv.reduce((sum, r) => sum + (r.totalAmount ?? 0), 0).toFixed(2)),
    penalties:           0,
  };

  return { publishedTrips, reservationRequests, notifications, reviews, stats, finance };
}
