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
      return NextResponse.json(result.data);
    }

    // Sinon → recherche (mode listing)
    const result = await TripService.search({}, auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const auth = await withAuth(req);

    const result = await TripService.create(body, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
