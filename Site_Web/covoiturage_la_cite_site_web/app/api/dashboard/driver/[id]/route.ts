/**
 * GET /api/dashboard/driver/[id]
 *
 * Route unifiée pour le dashboard conducteur.
 * Retourne en un seul appel toutes les données filtrées pour l'utilisateur :
 * - publishedTrips  : trajets publiés par ce conducteur
 * - reservationRequests : demandes de réservation en attente sur ses trajets
 * - notifications   : notifications adressées à cet utilisateur
 * - reviews         : avis reçus par cet utilisateur
 * - stats           : statistiques agrégées (trajets, CO₂, note, GoScore)
 * - finance         : résumé financier du conducteur
 */

import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

import type { TripModel }         from '@/core/models/TripModel';
import type { ReservationModel }  from '@/core/models/ReservationModel';
import type { NotificationModel } from '@/core/models/NotificationModel';
import type { ReviewModel }       from '@/core/models/ReviewModel';
import type { UserModel }         from '@/core/models/UserModel';

import {
  tripModelToPublishedTrip,
  reservationModelToRequest,
  notificationModelToNotification,
  reviewModelToReview,
} from '@/features/dashboard/converters/dashboard.converter';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: driverId } = await params;

    // ── Lecture de la base JSON ────────────────────────────────────────────────
    const allTrips   = persistenceManager.readAll<TripModel>('trips');
    const allRsv     = persistenceManager.readAll<ReservationModel>('reservations');
    const allNotifs  = persistenceManager.readAll<NotificationModel>('notifications');
    const allReviews = persistenceManager.readAll<ReviewModel>('reviews');
    const allUsers   = persistenceManager.readAll<UserModel>('users');

    // Map des utilisateurs pour les conversions
    const usersMap = new Map(allUsers.map((u) => [u.id, u]));
    const driver   = usersMap.get(driverId);
    if (!driver) {
      return NextResponse.json({ error: 'Conducteur introuvable' }, { status: 404 });
    }

    // ── 1. Trajets publiés par ce conducteur ───────────────────────────────────
    const driverTrips = allTrips.filter((t) => t.driverId === driverId);

    // Nombre de demandes en attente par trajet
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

    // ── 2. Demandes de réservation en attente ──────────────────────────────────
    const driverTripIds = new Set(driverTrips.map((t) => t.id));
    const reservationRequests = allRsv
      .filter((r) => r.status === 'pending' && driverTripIds.has(r.tripId))
      .map((r) => {
        const trip      = allTrips.find((t) => t.id === r.tripId);
        const passenger = usersMap.get(r.passengerId);
        if (!trip || !passenger) return null;
        return reservationModelToRequest(r, trip, passenger);
      })
      .filter(Boolean);

    // ── 3. Notifications de ce conducteur ─────────────────────────────────────
    const notifications = allNotifs
      .filter((n) => n.userId === driverId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(notificationModelToNotification);

    // ── 4. Avis reçus par ce conducteur ───────────────────────────────────────
    const reviews = allReviews
      .filter((r) => r.revieweeId === driverId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((r) => reviewModelToReview(r, usersMap.get(r.reviewerId)));

    // ── 5. Statistiques agrégées ───────────────────────────────────────────────
    const totalTripsAsDriver = driver.driverProfile?.totalTripsAsDriver ?? driverTrips.filter((t) => t.status === 'completed').length;
    const totalCo2 = driverTrips
      .filter((t) => t.status === 'completed')
      .reduce((sum, t) => sum + (t.co2SavedKg ?? 0), 0);
    const avgRating = driver.driverProfile?.averageRating ?? 0;
    const goScore   = driver.driverProfile?.reputationPoints ?? 0;

    const stats = {
      tripsCount:    totalTripsAsDriver,
      co2SavedKg:    parseFloat(totalCo2.toFixed(1)),
      averageRating: avgRating,
      goScore,
    };

    // ── 6. Résumé financier ────────────────────────────────────────────────────
    const completedRsv = allRsv.filter(
      (r) => r.driverId === driverId && r.status === 'completed'
    );
    const pendingRsv = allRsv.filter(
      (r) => r.driverId === driverId && r.status === 'in_progress'
    );

    const now = new Date();
    const startOfWeek  = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());

    // Solde disponible : lu depuis driver_finance_accounts pour cohérence avec la route dédiée
    const allFinanceAccounts = persistenceManager.readAll<{ driverId: string; soldeDisponible: number }>('driver_finance_accounts');
    const financeAccount = allFinanceAccounts.find((a) => a.driverId === driverId);
    const soldeDisponible = financeAccount?.soldeDisponible ?? 0;

    const weeklyProfit = completedRsv
      .filter((r) => r.completedAt && new Date(r.completedAt) >= startOfWeek)
      .reduce((sum, r) => sum + (r.totalAmount ?? 0), 0);

    const weeklyPendingProfit = pendingRsv
      .reduce((sum, r) => sum + (r.totalAmount ?? 0), 0);

    const finance = {
      soldeDisponible:      parseFloat(soldeDisponible.toFixed(2)),
      currency:             'CAD',
      weeklyProfit:         parseFloat(weeklyProfit.toFixed(2)),
      weeklyPendingProfit:  parseFloat(weeklyPendingProfit.toFixed(2)),
      penalties:            0,
    };

    return NextResponse.json({
      publishedTrips,
      reservationRequests,
      notifications,
      reviews,
      stats,
      finance,
    });
  } catch (err) {
    console.error('[dashboard/driver]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
