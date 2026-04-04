/**
 * GET /api/admin/trips
 * Délègue au Server Core — GET api/trips/search (sans filtre = tous)
 */
import { NextResponse } from 'next/server';
import { TripService } from '@/server/services/TripService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await TripService.search({}, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data?.items ?? []);
  } catch (err) {
    console.error('[admin/trips]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
