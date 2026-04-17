/**
 * GET /api/dashboard/passenger/[id]
 * Délègue au Server Core — agrège reservations, notifications, reviews.
 */
import { NextResponse } from 'next/server';
import { ReservationService, type ReservationEnrichedDto } from '@/server/services/ReservationService';
import { NotificationService } from '@/server/services/NotificationService';
import { ReviewService } from '@/server/services/SocialService';
import { GoTaskService } from '@/server/services/GamificationService';
import { UserService } from '@/server/services/UserService';
import { withAuth } from '@/server/auth';
import { ReservationStatus, type Reservation } from '@/features/dashboard/types';

import { fetchReviewerProfiles, toDashboardReview } from '@/server/utils/review-enricher';

function mapStatus(raw?: string): ReservationStatus {
  const value = (raw ?? '').toLowerCase();
  if (value === 'confirmed') return ReservationStatus.Confirmed;
  if (value === 'in_progress') return ReservationStatus.InProgress;
  if (value === 'completed') return ReservationStatus.Completed;
  if (value === 'cancelled') return ReservationStatus.Cancelled;
  if (value === 'refused') return ReservationStatus.Rejected;
  return ReservationStatus.Pending;
}

function toPassengerReservation(dto: ReservationEnrichedDto): Reservation {
  if (dto.reservation && dto.trip && dto.driver) {
    return {
      id: dto.reservation.id,
      tripId: dto.reservation.tripId,
      departure: dto.trip.departureLabel ?? '',
      destination: dto.trip.arrivalLabel ?? '',
      date: (dto.trip.departureDate ?? '').slice(0, 10),
      time: dto.trip.departureTime ?? '',
      duration: dto.trip.estimatedDurationMinutes ?? null,
      maxPassengers: dto.trip.maxPassengers ?? 0,
      passengers: [],
      driver: {
        id: dto.driver.id,
        pictureUrl: dto.driver.avatarUrl ?? '',
        name: `${dto.driver.firstName} ${dto.driver.lastName}`.trim(),
        rating: dto.driver.averageRating ?? 0,
        tripsCount: dto.driver.totalTripsAsDriver ?? 0,
      },
      status: mapStatus(dto.reservation.status),
      doneDate: dto.reservation.status?.toLowerCase() === 'completed'
        ? (dto.reservation.updatedAt ?? null)
        : null,
      isImminent: false,
    };
  }

  return {
    id: dto.id ?? '',
    tripId: dto.tripId ?? '',
    departure: dto.tripDepartureAddress ?? '',
    destination: dto.tripArrivalAddress ?? '',
    date: (dto.tripDepartureDate ?? '').slice(0, 10),
    time: (dto.tripDepartureDate ?? '').length >= 16 ? (dto.tripDepartureDate ?? '').slice(11, 16) : '',
    duration: null,
    maxPassengers: 0,
    passengers: [],
    driver: { id: '', pictureUrl: '', name: '', rating: 0, tripsCount: 0 },
    status: ReservationStatus.Pending,
    doneDate: null,
    isImminent: false,
  };
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await params;
    const auth = await withAuth(req);

    const [reservationsRes, notificationsRes, reviewsRes, goBoardRes, meRes] = await Promise.all([
      ReservationService.getPassengerEnriched(undefined, auth),
      NotificationService.getAll(1, 50, auth),
      ReviewService.getReceived(auth),
      GoTaskService.getGoBoard(auth),
      UserService.getMe(auth),
    ]);

    const rawReservations = (reservationsRes.data ?? []) as ReservationEnrichedDto[];
    const reservations = rawReservations.map(toPassengerReservation);

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

    const passengerCo2 = (meRes.data as unknown as { passengerProfile?: { co2SavedKg?: number } } | undefined)?.passengerProfile?.co2SavedKg ?? 0;

    return NextResponse.json({
      reservations,
      notifications: notificationsRes.data ?? [],
      reviews,
      stats: {
        tripsCount: rawReservations.length,
        co2SavedKg: passengerCo2,
        averageRating: reviews.length > 0
          ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10) / 10
          : 0,
        goScore: goBoardRes.data?.goScore ?? 0,
      },
    });
  } catch (err) {
    console.error('[dashboard/passenger]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
