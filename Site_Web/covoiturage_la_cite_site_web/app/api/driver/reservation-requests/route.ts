/**
 * GET /api/driver/reservation-requests
 * Délègue au Server Core — GET api/reservations/driver-requests
 * Transforme ReservationEnrichedDto (format Server Core) en ReservationRequest (format client).
 */
import { NextResponse } from 'next/server';
import { ReservationService, type ReservationEnrichedDto } from '@/server/services/ReservationService';
import { withAuth } from '@/server/auth';
import type { ReservationRequest } from '@/features/dashboard/types';

/**
 * Convertit un ReservationEnrichedDto (Server Core) en ReservationRequest (format attendu par le client).
 * Note : applicant.note et applicant.doneTrips ne sont pas disponibles dans le DTO — valeur neutre 0.
 * Note : maxPassengers n'est pas disponible dans le DTO — valeur neutre 0.
 */
function toReservationRequest(dto: ReservationEnrichedDto): ReservationRequest {
  const rawDate = dto.tripDepartureDate ?? '';
  const date = rawDate.slice(0, 10);
  const time = rawDate.length >= 16 ? rawDate.slice(11, 16) : '';

  return {
    id: dto.id,
    applicant: {
      id: dto.passengerId,
      urlPicture: dto.passengerAvatarUrl ?? '',
      name: dto.passengerName ?? 'Membre La Cité',
      note: 0,
      doneTrips: 0,
    },
    departure: dto.tripDepartureAddress ?? '',
    destination: dto.tripArrivalAddress ?? '',
    date,
    time,
    maxPassengers: 0,
    currentPassengers: dto.seatsReserved,
    price: dto.passengerPrice,
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
