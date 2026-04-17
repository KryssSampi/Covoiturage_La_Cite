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
import { GoTaskService } from '@/server/services/GamificationService';
import { UserService } from '@/server/services/UserService';
import { withAuth } from '@/server/auth';

import { fetchReviewerProfiles, toDashboardReview } from '@/server/utils/review-enricher';

/** Mappe NotificationType C# → NotificationType frontend */
function mapNotifType(serverType: string): string {
  const map: Record<string, string> = {
    ReservationReceived: 'confirmation',
    ReservationAccepted: 'confirmation',
    ReservationRefused:  'annulation',
    ReservationCancelled:'annulation',
    TripCancelled:       'annulation',
    TripReminder:        'rappel',
    TripStartingSoon:    'urgent rappel',
    TripStarted:         'infos',
    TripCompleted:       'infos',
    PenaltyApplied:      'urgent rappel',
    NewReview:           'nouvelle-avis',
    SosAlert:            'urgent rappel',
    Suggestion:          'alerte-trajet',
    BadgeEarned:         'infos',
    ChallengeCompleted:  'infos',
    GoTaskCompleted:     'infos',
    GoScoreMilestone:    'infos',
    RecommendedTrip:     'alerte-trajet',
    Welcome:             'infos',
    HowItWorks:          'infos',
    System:              'infos',
    DocumentValidated:   'confirmation',
  };
  return map[serverType] ?? 'infos';
}

function normalizeStatus(raw: string): string {
  const map: Record<string, string> = {
    Published:   'published',   published:    'published',
    Full:        'full',        full:         'full',
    Confirmed:   'confirmed',   confirmed:    'confirmed',
    InProgress:  'in-progress', in_progress:  'in-progress', 'in-progress': 'in-progress',
    Completed:   'completed',   completed:    'completed',
    Cancelled:   'cancelled',   cancelled:    'cancelled',
    NoShow:      'no-show',     no_show:      'no-show',     'no-show':    'no-show',
  };
  return map[raw] ?? raw.toLowerCase();
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const auth = await withAuth(req);

    const [tripsRes, reservationsRes, notificationsRes, reviewsRes, financeRes, goBoardRes, meRes] = await Promise.all([
      TripService.getMyDriverTrips(undefined, 1, 50, auth),
      ReservationService.getDriverRequests(auth),
      NotificationService.getAll(1, 50, auth),
      ReviewService.getReceived(auth),
      FinanceService.getDriverSummary(auth),
      GoTaskService.getGoBoard(auth),
      UserService.getMe(auth),
    ]);

    const rawReservations = reservationsRes.data ?? [];

    // Count pending reservation requests per trip
    const pendingCountByTrip = new Map<string, number>();
    for (const r of rawReservations) {
      const tripId = r.trip?.id ?? r.tripId ?? '';
      const status = (r.reservation?.status ?? r.status ?? '').toLowerCase();
      if (tripId && status === 'pending') {
        pendingCountByTrip.set(tripId, (pendingCountByTrip.get(tripId) ?? 0) + 1);
      }
    }

    // Group confirmed passengers per trip
    const passengersByTrip = new Map<string, { id: string; pictureUrl: string; name: string; rating: number; tripsCount: number }[]>();
    for (const r of rawReservations) {
      const tripId = r.trip?.id ?? r.tripId ?? '';
      const status = (r.reservation?.status ?? r.status ?? '').toLowerCase();
      if (tripId && (status === 'confirmed' || status === 'accepted')) {
        const p = r.passenger;
        const existing = passengersByTrip.get(tripId) ?? [];
        existing.push({
          id:         p?.id          ?? r.passengerId ?? '',
          pictureUrl: p?.avatarUrl   ?? r.passengerAvatarUrl ?? '',
          name:       p ? `${p.firstName} ${p.lastName}`.trim() : (r.passengerName ?? ''),
          rating:     p?.averageRating        ?? 0,
          tripsCount: p?.totalTripsAsPassenger ?? 0,
        });
        passengersByTrip.set(tripId, existing);
      }
    }

    // Transforme TrajetResponseDto (Server Core) → PublishedTrip (frontend)
    const rawTrips = tripsRes.data?.items ?? [];
    const publishedTrips = rawTrips.map((t) => ({
      id:              t.id,
      driverId:        t.driverId,
      departure:       t.departureLabel || t.departureAddress || '',
      destination:     t.arrivalLabel   || t.arrivalAddress   || '',
      date:            String(t.departureDate  ?? ''),
      time:            String(t.departureTime  ?? ''),
      duration:        t.estimatedDurationMinutes || 30,
      maxPassengers:   t.maxPassengers,
      passengers:      passengersByTrip.get(t.id) ?? [],
      price:           Number(t.pricePerPassenger ?? 0),
      pendingRequests: pendingCountByTrip.get(t.id) ?? 0,
      status:          normalizeStatus(t.status ?? 'published'),
      departureCoords: t.departureLat != null ? [t.departureLng, t.departureLat] as [number, number] : undefined,
      arrivalCoords:   t.arrivalLat   != null ? [t.arrivalLng,   t.arrivalLat]   as [number, number] : undefined,
      isImminent:      false,
    }));


    const rawReviews = reviewsRes.data ?? [];
    const reviewerProfiles = await fetchReviewerProfiles(
      rawReviews.map((r) => String(r.reviewerId)),
      auth,
    );
    const reviews = rawReviews.map((r) =>
      toDashboardReview(
        { ...r, id: String(r.id), reviewerId: String(r.reviewerId), revieweeId: String(r.revieweeId), createdAt: String(r.createdAt) },
        String(r.revieweeId),
        reviewerProfiles.get(String(r.reviewerId)),
      )
    );
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum: number, r) => sum + r.rating, 0) / reviews.length
      : 0;

    const finance = financeRes.data;
    const board = goBoardRes.data;

    const driverProfile = meRes.data?.driverProfile as { co2SavedKg?: number } | undefined;

    // Transforme NotificationResponseDto (Server Core) → Notification (frontend)
    const rawNotifs = notificationsRes.data ?? [];
    const notifications = rawNotifs.map((n) => {
      const dt = new Date(n.createdAt);
      return {
        id:                   n.id,
        userId:               n.userId,
        title:                n.title,
        type:                 mapNotifType(n.type),
        message:              n.body,
        date:                 dt.toISOString().slice(0, 10),
        time:                 dt.toTimeString().slice(0, 5),
        isRead:               n.isRead,
        isImportant:          n.isImportant,
        relatedTripId:        n.relatedTripId ?? null,
        relatedReservationId: n.relatedReservationId ?? null,
        createdAt:            n.createdAt,
        link:                 n.deepLink,
      };
    });

    const reservationRequests = rawReservations.map((r) => {
      const isNested = !!(r.reservation && r.trip && r.passenger);
      return {
        id:  isNested ? r.reservation!.id  : (r.id ?? ''),
        applicant: {
          id:         isNested ? r.passenger!.id        : (r.passengerId ?? ''),
          urlPicture: isNested ? (r.passenger!.avatarUrl ?? '') : (r.passengerAvatarUrl ?? ''),
          name:       isNested
            ? `${r.passenger!.firstName} ${r.passenger!.lastName}`.trim()
            : (r.passengerName ?? r.passengerId ?? ''),
          note:      r.passenger?.averageRating        ?? 0,
          doneTrips: r.passenger?.totalTripsAsPassenger ?? 0,
        },
        departure:         isNested ? (r.trip!.departureLabel ?? '') : (r.tripDepartureAddress ?? ''),
        destination:       isNested ? (r.trip!.arrivalLabel   ?? '') : (r.tripArrivalAddress   ?? ''),
        date:              isNested
          ? (r.trip!.departureDate ?? '').slice(0, 10)
          : (r.tripDepartureDate   ?? r.createdAt?.slice(0, 10) ?? ''),
        time:              isNested ? (r.trip!.departureTime ?? '') : '',
        maxPassengers:     isNested ? (r.trip!.maxPassengers ?? 0) : (r.seatsReserved ?? 1),
        currentPassengers: 0,
        price:             isNested ? r.reservation!.passengerPrice : (r.passengerPrice ?? 0),
      };
    });

    return NextResponse.json({
      publishedTrips,
      reservationRequests,
      notifications,
      reviews: reviews,
      stats: {
        tripsCount:    tripsRes.data?.totalCount ?? 0,
        co2SavedKg:    driverProfile?.co2SavedKg ?? 0,
        averageRating: Math.round(avgRating * 10) / 10,
        goScore:       board?.goScore ?? 0,
      },
      finance: {
        soldeDisponible:     finance?.soldeDisponible  ?? 0,
        currency:            finance?.currency         ?? 'CAD',
        weeklyProfit:        finance?.gainSemaine      ?? 0,
        weeklyPendingProfit: finance?.soldeEnTransit   ?? 0,
        penalties:           finance?.soldePenalites   ?? 0,
      },
    });
  } catch (err) {
    console.error('[dashboard/driver]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
