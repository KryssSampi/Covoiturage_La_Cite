/**
 * GET /api/dashboard/passenger/[id]
 * Délègue au Server Core — agrège reservations, notifications, reviews.
 */
import { NextResponse } from 'next/server';
import { ReservationService } from '@/server/services/ReservationService';
import { NotificationService } from '@/server/services/NotificationService';
import { ReviewService } from '@/server/services/SocialService';
import { withAuth } from '@/server/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const auth = await withAuth(req);

    const [reservationsRes, notificationsRes, reviewsRes] = await Promise.all([
      ReservationService.getPassengerEnriched(undefined, auth),
      NotificationService.getAll(1, 50, auth),
      ReviewService.getReceived(auth),
    ]);

    return NextResponse.json({
      reservations: reservationsRes.data ?? [],
      notifications: notificationsRes.data ?? [],
      reviews: reviewsRes.data ?? [],
      stats: {
        tripsCount: Array.isArray(reservationsRes.data) ? reservationsRes.data.length : 0,
        co2SavedKg: 0,
        averageRating: 0,
        goScore: 0,
      },
    });
  } catch (err) {
    console.error('[dashboard/passenger]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
