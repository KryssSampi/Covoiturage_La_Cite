/**
 * GET /api/trajet-en-cours/[id]
 * Délègue au Server Core — GET api/trips/{id}/live
 */
import { NextResponse } from 'next/server';
import { TripService } from '@/server/services/TripService';
import { withAuth } from '@/server/auth';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id: tripId } = await params;
    const auth = await withAuth(req);

    const result = await TripService.getLive(tripId, auth);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message ?? 'Trajet introuvable ou données incomplètes' },
        { status: 404 },
      );
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[trajet-en-cours/GET]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
