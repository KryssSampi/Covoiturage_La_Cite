import { NextResponse } from 'next/server';
import { withAuth } from '@/server/auth';
import { TripService } from '@/server/services/TripService';

type PositionsPayload = {
  driverPos: { lat: number; lng: number } | null;
  passengerPositions: Array<{ userId: string; pos: { lat: number; lng: number } | null }>;
  alreadyOnTheirWay: boolean;
  theyReallyEnd: boolean;
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const auth = await withAuth(req);

    const live = await TripService.getLive(id, auth);
    if (!live.success || !live.data) {
      return NextResponse.json({ error: live.message ?? 'Trajet introuvable' }, { status: 404 });
    }

    const trip = live.data.trip;
    const payload: PositionsPayload = {
      driverPos: live.data.driverPosition
        ? { lat: live.data.driverPosition.lat, lng: live.data.driverPosition.lng }
        : null,
      passengerPositions: [],
      alreadyOnTheirWay: trip.status === 'in_progress' || trip.status === 'completed',
      theyReallyEnd: trip.status === 'completed',
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error('[GET /api/trips/[id]/positions]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
