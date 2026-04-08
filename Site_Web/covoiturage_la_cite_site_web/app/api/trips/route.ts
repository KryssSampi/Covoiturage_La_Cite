/**
 * GET  /api/trips  — Liste/recherche de trajets
 * POST /api/trips  — Création d'un trajet
 */

import { NextResponse } from 'next/server';
import { TripService } from '@/server/services/TripService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const auth = await withAuth(req);

    const driverId = searchParams.get('driverId');

    // Si driverId fourni → trajets du conducteur
    if (driverId) {
      const result = await TripService.getMyDriverTrips(undefined, 1, 50, auth);
      if (!result.success) {
        return NextResponse.json({ error: result.message }, { status: 500 });
      }
      return NextResponse.json(result.data?.items ?? []);
    }

    // Sinon → recherche (mode listing)
    const result = await TripService.search({}, auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json(result.data?.items ?? []);
  } catch (err) {
    console.error('[api/trips]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await withAuth(req);

    if (!auth.token)
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });

    const raw = await req.json();

    // Transformation frontend → Server Core CreateTrajetDto
    const body = {
      vehicleId:        raw.vehicleId,
      // Départ
      departureLabel:   raw.departure?.label   ?? raw.departureAddress ?? '',
      departureAddress: raw.departure?.fullAddress ?? raw.departureAddress ?? '',
      departureLat:     raw.departure?.coordinates?.lat ?? raw.departureLat,
      departureLng:     raw.departure?.coordinates?.lng ?? raw.departureLng,
      // Arrivée
      arrivalLabel:     raw.arrival?.label     ?? raw.arrivalAddress ?? '',
      arrivalAddress:   raw.arrival?.fullAddress ?? raw.arrivalAddress ?? '',
      arrivalLat:       raw.arrival?.coordinates?.lat ?? raw.arrivalLat,
      arrivalLng:       raw.arrival?.coordinates?.lng ?? raw.arrivalLng,
      // Horaire
      departureDate:    raw.departureDate,
      departureTime:    raw.departureTime,
      // Capacité
      maxPassengers:    raw.maxPassengers,
      pricePerPassenger: raw.pricePerPassenger,
      paymentMethod:    raw.paymentMethod,
      // Type
      tripType:         raw.tripType ?? 'unique',
      recurrenceDays:   raw.recurringDays,
      // Préférences (imbriquées ou à plat)
      baggageAllowed:   raw.preferences?.baggageAllowed  ?? raw.baggageAllowed  ?? true,
      petsAllowed:      raw.preferences?.petsAllowed     ?? raw.petsAllowed     ?? false,
      smokingAllowed:   raw.preferences?.smokingAllowed  ?? raw.smokingAllowed  ?? false,
      musicAllowed:     raw.preferences?.musicAllowed    ?? raw.musicAllowed    ?? true,
      conversationLevel: raw.preferences?.conversationLevel ?? raw.conversationLevel ?? 'moderate',
      driverNote:       raw.preferences?.driverNote      ?? raw.notes,
    };

    const result = await TripService.create(body, auth);

    if (!result.success) {
      console.error('[POST /api/trips] Server Core error:', result.message);
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (err) {
    console.error('[api/trips]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
