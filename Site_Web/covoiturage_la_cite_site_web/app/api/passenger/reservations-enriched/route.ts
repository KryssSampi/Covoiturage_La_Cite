/**
 * GET /api/passenger/reservations-enriched
 * Delegue au Server Core -> GET api/passenger/reservations-enriched
 * Normalize en Reservation[] pour le frontend.
 */
import { NextResponse } from 'next/server';
import { ReservationService, type ReservationEnrichedDto } from '@/server/services/ReservationService';
import { withAuth } from '@/server/auth';
import { ReservationStatus, type Reservation } from '@/features/dashboard/types';

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
  // Nested format (Server Core actuel)
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

  // Flat fallback (retro-compat)
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
    driver: {
      id: '',
      pictureUrl: '',
      name: '',
      rating: 0,
      tripsCount: 0,
    },
    status: ReservationStatus.Pending,
    doneDate: null,
    isImminent: false,
  };
}

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await ReservationService.getPassengerEnriched(undefined, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    const enriched = (result.data ?? []) as ReservationEnrichedDto[];
    const payload = enriched.map(toPassengerReservation);

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[api/passenger/reservations-enriched]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
