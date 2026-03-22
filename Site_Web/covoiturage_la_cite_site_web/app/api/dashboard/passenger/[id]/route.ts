/**
 * GET /api/dashboard/passenger/[id]
 *
 * Route unifiée pour le dashboard passager.
 * Retourne en un seul appel toutes les données filtrées pour l'utilisateur :
 * - reservations    : réservations du passager
 * - notifications   : notifications adressées à cet utilisateur
 * - reviews         : avis reçus par cet utilisateur
 * - stats           : statistiques agrégées (trajets, CO₂, note, GoScore)
 */

import { NextResponse } from 'next/server';
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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: passengerId } = await params;

    // ── Lecture de la base JSON ────────────────────────────────────────────────
    const allTrips   = persistenceManager.readAll<TripModel>('trips');
    const allRsv     = persistenceManager.readAll<ReservationModel>('reservations');
    const allNotifs  = persistenceManager.readAll<NotificationModel>('notifications');
    const allReviews = persistenceManager.readAll<ReviewModel>('reviews');
    const allUsers   = persistenceManager.readAll<UserModel>('users');

    // Map des utilisateurs pour les conversions
    const usersMap   = new Map(allUsers.map((u) => [u.id, u]));
    const passenger  = usersMap.get(passengerId);
    if (!passenger) {
      return NextResponse.json({ error: 'Passager introuvable' }, { status: 404 });
    }

    // ── 1. Réservations du passager ────────────────────────────────────────────
    const reservations = allRsv
      .filter((r) => r.passengerId === passengerId)
      .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime())
      .map((r) => {
        const trip   = allTrips.find((t) => t.id === r.tripId);
        const driver = usersMap.get(r.driverId);
        if (!trip || !driver) return null;
        return tripModelToReservation(trip, r, driver);
      })
      .filter(Boolean);

    // ── 2. Notifications du passager ──────────────────────────────────────────
    const notifications = allNotifs
      .filter((n) => n.userId === passengerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(notificationModelToNotification);

    // ── 3. Avis reçus par ce passager ─────────────────────────────────────────
    const reviews = allReviews
      .filter((r) => r.revieweeId === passengerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((r) => reviewModelToReview(r, usersMap.get(r.reviewerId)));

    // ── 4. Statistiques agrégées ───────────────────────────────────────────────
    const passengerTrips = allRsv.filter(
      (r) => r.passengerId === passengerId && r.status === 'completed'
    );
    const tripModels = passengerTrips
      .map((r) => allTrips.find((t) => t.id === r.tripId))
      .filter((t): t is TripModel => t !== undefined);

    const totalCo2 = tripModels.reduce((sum, t) => sum + (t.co2SavedKg ?? 0), 0);
    const avgRating = passenger.passengerProfile?.averageRating ?? 0;
    // GoScore lu directement sur le UserModel (champ goScore commun à tous les rôles)
    const goScore   = passenger.goScore ?? 0;

    const stats = {
      tripsCount:    passenger.passengerProfile?.totalTripsAsPassenger ?? passengerTrips.length,
      co2SavedKg:    parseFloat((passenger.passengerProfile?.co2SavedKg ?? totalCo2).toFixed(1)),
      averageRating: avgRating,
      goScore,
    };

    return NextResponse.json({
      reservations,
      notifications,
      reviews,
      stats,
    });
  } catch (err) {
    console.error('[dashboard/passenger]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
