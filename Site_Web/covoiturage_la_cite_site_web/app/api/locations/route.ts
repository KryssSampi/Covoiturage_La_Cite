import { NextResponse } from 'next/server';
import { withAuth } from '@/server/auth';
import { GpsService } from '@/server/services/GpsService';

type LocationPatchBody = {
  userId?: string;
  lat?: number;
  lng?: number;
  tripId?: string;
  speedKmh?: number;
  headingDegrees?: number;
  accuracyMeters?: number;
};

export async function PATCH(req: Request) {
  try {
    const auth = await withAuth(req);
    if (!auth.token) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    const body = (await req.json()) as LocationPatchBody;
    const tripId = body.tripId?.toString() ?? '';
    const lat = Number(body.lat);
    const lng = Number(body.lng);

    if (!tripId) {
      return NextResponse.json({ error: 'tripId requis' }, { status: 400 });
    }
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json({ error: 'lat/lng invalides' }, { status: 400 });
    }

    const result = await GpsService.recordPosition(
      {
        tripId,
        latitude: lat,
        longitude: lng,
        speedKmh: Number(body.speedKmh ?? 0),
        headingDegrees: Number(body.headingDegrees ?? 0),
        accuracyMeters: Number(body.accuracyMeters ?? 0),
      },
      auth,
    );

    if (!result.success) {
      return NextResponse.json({ error: result.message ?? 'Echec suivi GPS' }, { status: 400 });
    }

    return NextResponse.json({ ok: true, data: result.data ?? null });
  } catch (error) {
    console.error('[PATCH /api/locations]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
