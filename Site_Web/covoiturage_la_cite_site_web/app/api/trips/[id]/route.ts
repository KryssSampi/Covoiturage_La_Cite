import { NextResponse } from 'next/server';
import { deleteTripById, getTripById, patchTripById } from '@/core/services/trip-lifecycle-api.service';

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const trip = getTripById(id);
    if (!trip) return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 });
    return NextResponse.json(trip);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// Champs qu'un conducteur peut modifier sur son propre trajet.
// Les champs système (id, driverId, status, currentPassengers, passengerIds,
// createdAt, updatedAt) ne sont jamais acceptés depuis le client.
const DRIVER_EDITABLE_FIELDS = new Set([
  'departure', 'arrival', 'waypoints', 'polyline',
  'departureDate', 'departureTime', 'estimatedArrivalTime',
  'estimatedDistanceKm', 'estimatedDurationMinutes',
  'maxPassengers', 'pricePerPassenger', 'paymentMethod',
  'tripType', 'recurrenceDays', 'recurrenceEndDate',
  'preferences', 'languagePreference', 'maxBaggageLevel',
  'minPassengerGoScore', 'notes', 'vehicleId',
]);

export async function PATCH(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Record<string, unknown>;

    const existing = getTripById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 });
    }

    // Vérification de propriété : le demandeur doit être le conducteur du trajet.
    const callerId = body.callerId as string | undefined;
    if (!callerId || callerId !== existing.driverId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Filtrage strict : seuls les champs de la whitelist sont appliqués.
    const patch: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (DRIVER_EDITABLE_FIELDS.has(key)) {
        patch[key] = value;
      }
    }

    if (Object.keys(patch).length === 0) {
      return NextResponse.json({ error: 'Aucun champ modifiable fourni' }, { status: 400 });
    }

    return NextResponse.json(patchTripById(id, patch));
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: Context) {
  try {
    const { id } = await params;
    const existing = getTripById(id);

    if (!existing) {
      return NextResponse.json({ error: 'Trajet introuvable' }, { status: 404 });
    }

    // Vérification de propriété via header X-Caller-Id.
    const callerId = req.headers.get('x-caller-id');
    if (!callerId || callerId !== existing.driverId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    // Un trajet en cours ou complété ne peut pas être supprimé.
    const nonDeletableStatuses = new Set(['in_progress', 'completed']);
    if (nonDeletableStatuses.has(existing.status as string)) {
      return NextResponse.json({ error: 'Impossible de supprimer un trajet en cours ou terminé' }, { status: 409 });
    }

    deleteTripById(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
