/**
 * GET  /api/trips  — Liste/recherche de trajets
 * POST /api/trips  — Création d'un trajet
 */

import { NextResponse } from 'next/server';
import { TripService } from '@/server/services/TripService';
import { fetchPhotonSuggestions } from '@/core/services/location-suggestion.server';
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

    // Si le frontend a envoyé l'offset timezone, convertir la date/heure locale en UTC
    let departureDateValue = raw.departureDate;
    let departureTimeValue = raw.departureTime;
    try {
      if (raw.utcOffsetMinutes != null && raw.departureDate && raw.departureTime) {
        const d = new Date(`${raw.departureDate}T${raw.departureTime}:00`);
        d.setMinutes(d.getMinutes() + Number(raw.utcOffsetMinutes));
        departureDateValue = d.toISOString().slice(0, 10);
        departureTimeValue = d.toISOString().slice(11, 16);
      }
    } catch (e) {
      // noop — garder les valeurs envoyées
    }

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
      // Horaire (déjà converti en UTC si frontend a renseigné `utcOffsetMinutes`)
      departureDate:    departureDateValue,
      departureTime:    departureTimeValue,
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
      driverNote:               raw.preferences?.driverNote ?? raw.notes,
      // Données géo calculées par ORS côté client
      estimatedDurationMinutes: raw.estimatedDurationMinutes ?? raw.estimatedDuration ?? 0,
      estimatedDistanceKm:      raw.estimatedDistanceKm ?? raw.estimatedDistance ?? 0,
      polyline:                 raw.polyline ? JSON.stringify(raw.polyline) : null,
    };

    // Si les coordonnées sont manquantes ou nulles, tenter un geocodage Photon
    try {
      if ((!body.departureLat || !body.departureLng) && (body.departureAddress || body.departureLabel)) {
        const q = body.departureAddress || body.departureLabel;
        const suggestions = await fetchPhotonSuggestions(q);
        if (suggestions.length > 0) {
          // Photon renvoie [lng, lat]
          const [lng, lat] = suggestions[0].coordinates;
          body.departureLat = lat;
          body.departureLng = lng;
        }
      }

      if ((!body.arrivalLat || !body.arrivalLng) && (body.arrivalAddress || body.arrivalLabel)) {
        const q = body.arrivalAddress || body.arrivalLabel;
        const suggestions = await fetchPhotonSuggestions(q);
        if (suggestions.length > 0) {
          const [lng, lat] = suggestions[0].coordinates;
          body.arrivalLat = lat;
          body.arrivalLng = lng;
        }
      }
    } catch (e) {
      // Ne bloque pas la création si Photon échoue; on logue et on continue
      console.warn('[api/trips] geocoding fallback failed:', e);
    }

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
