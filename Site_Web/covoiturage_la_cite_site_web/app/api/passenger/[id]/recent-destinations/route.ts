import { NextResponse } from 'next/server';
import { HistoriqueService } from '@/server/services/HistoriqueService';
import { withAuth } from '@/server/auth';
import type { Destination } from '@/features/dashboard/types/destination.types';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Context) {
  try {
    await params;
    const auth = await withAuth(req);
    const { searchParams } = new URL(req.url);
    const parsed = Number.parseInt(searchParams.get('limit') ?? '5', 10);
    const limit = Number.isFinite(parsed) && parsed > 0 ? parsed : 5;

    const result = await HistoriqueService.getPassengerHistorique({ pageSize: 50 }, auth);
    if (!result.success || !result.data) {
      return NextResponse.json([], { status: 200 });
    }

    const seen = new Set<string>();
    const destinations: Destination[] = [];

    for (const entry of result.data) {
      const key = `${entry.origin}|${entry.destination}`;
      if (seen.has(key)) continue;

      seen.add(key);
      destinations.push({
        id: entry.tripId,
        departure: entry.origin,
        destination: entry.destination,
        disponibility: 1,
        favoriteDriverCount: 0,
      });

      if (destinations.length >= limit) break;
    }

    return NextResponse.json(destinations);
  } catch (err) {
    console.error('[api/passenger/[id]/recent-destinations]', err);
    return NextResponse.json([], { status: 200 });
  }
}
