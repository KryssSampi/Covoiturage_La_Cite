/**
 * GET /api/driver/reservation-requests
 * Delegue au Server Core -> GET api/driver/reservation-requests
 * Mappe le DTO enrichi (nested ou flat) vers ReservationRequest (frontend).
 */
import { NextResponse } from 'next/server';
import { ReservationService, type ReservationEnrichedDto } from '@/server/services/ReservationService';
import { withAuth } from '@/server/auth';
import type { ReservationRequest } from '@/features/dashboard/types';

function toReservationRequest(dto: ReservationEnrichedDto): ReservationRequest {
  // Nested format (Server Core actuel)
  if (dto.reservation && dto.trip && dto.passenger) {
    const rawDate = dto.trip.departureDate ?? '';
    return {
      id: dto.reservation.id,
      applicant: {
        id: dto.passenger.id,
        urlPicture: dto.passenger.avatarUrl ?? '',
        name: `${dto.passenger.firstName} ${dto.passenger.lastName}`.trim(),
        note: dto.passenger.averageRating ?? 0,
        doneTrips: dto.passenger.totalTripsAsPassenger ?? 0,
      },
      departure: dto.trip.departureLabel ?? '',
      destination: dto.trip.arrivalLabel ?? '',
      date: rawDate.slice(0, 10),
      time: rawDate.length >= 16 ? rawDate.slice(11, 16) : (dto.trip.departureTime ?? ''),
      maxPassengers: dto.trip.maxPassengers ?? 0,
      currentPassengers: dto.reservation.seatsReserved,
      price: dto.reservation.passengerPrice,
    };
  }

  // Flat fallback (retro-compat)
  const rawDate = dto.tripDepartureDate ?? '';
  return {
    id: dto.id ?? '',
    applicant: {
      id: dto.passengerId ?? '',
      urlPicture: dto.passengerAvatarUrl ?? '',
      name: dto.passengerName ?? 'Membre La Cite',
      note: 0,
      doneTrips: 0,
    },
    departure: dto.tripDepartureAddress ?? '',
    destination: dto.tripArrivalAddress ?? '',
    date: rawDate.slice(0, 10),
    time: rawDate.length >= 16 ? rawDate.slice(11, 16) : '',
    maxPassengers: 0,
    currentPassengers: dto.seatsReserved ?? 0,
    price: dto.passengerPrice ?? 0,
  };
}

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await ReservationService.getDriverRequests(auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    const enriched = (result.data ?? []) as ReservationEnrichedDto[];
    const payload: ReservationRequest[] = enriched.map(toReservationRequest);

    return NextResponse.json(payload);
  } catch (err) {
    console.error('[api/driver/reservation-requests]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
