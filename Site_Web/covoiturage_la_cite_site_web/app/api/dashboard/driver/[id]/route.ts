/**
 * GET /api/dashboard/driver/[id]
 * Délègue au Server Core — agrège trips, reservations, notifications, reviews, finance.
 */
import { NextResponse } from 'next/server';
import { TripService } from '@/server/services/TripService';
import { ReservationService } from '@/server/services/ReservationService';
import { NotificationService } from '@/server/services/NotificationService';
import { ReviewService } from '@/server/services/SocialService';
import { FinanceService } from '@/server/services/FinanceService';
import { withAuth } from '@/server/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const auth = await withAuth(req);

    const [tripsRes, reservationsRes, notificationsRes, reviewsRes, financeRes] = await Promise.all([
      TripService.getMyDriverTrips(undefined, 1, 50, auth),
      ReservationService.getDriverRequests(auth),
      NotificationService.getAll(1, 50, auth),
      ReviewService.getReceived(auth),
      FinanceService.getDriverSummary(auth),
    ]);

    return NextResponse.json({
      publishedTrips: tripsRes.data?.items ?? [],
      reservationRequests: reservationsRes.data ?? [],
      notifications: notificationsRes.data ?? [],
      reviews: reviewsRes.data ?? [],
      stats: {
        tripsCount: tripsRes.data?.totalCount ?? 0,
        co2SavedKg: 0,
        averageRating: 0,
        goScore: 0,
      },
      finance: {
        soldeDisponible: financeRes.data?.availableBalance ?? 0,
        currency: 'CAD',
        weeklyProfit: financeRes.data?.totalEarnings ?? 0,
        weeklyPendingProfit: financeRes.data?.pendingBalance ?? 0,
        penalties: financeRes.data?.activePenalties ?? 0,
      },
    });
  } catch (err) {
    console.error('[dashboard/driver]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
