import { NextResponse } from 'next/server';
import { HistoriqueService, type HistoriqueEntryDto } from '@/server/services/HistoriqueService';
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

    const result = await HistoriqueService.getPassengerHistorique({ pageSize: 100 }, auth);
    if (!result.success || !result.data) {
      return NextResponse.json([], { status: 200 });
    }

    const freq = new Map<string, { entry: HistoriqueEntryDto; count: number }>();

    for (const entry of result.data) {
      const key = `${entry.origin}|${entry.destination}`;
      const existing = freq.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        freq.set(key, { entry, count: 1 });
      }
    }

    const destinations: Destination[] = [...freq.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(({ entry, count }) => ({
        id: entry.tripId,
        departure: entry.origin,
        destination: entry.destination,
        disponibility: count,
        favoriteDriverCount: 0,
      }));

    return NextResponse.json(destinations);
  } catch (err) {
    console.error('[api/passenger/[id]/usual-destinations]', err);
    return NextResponse.json([], { status: 200 });
  }
}
