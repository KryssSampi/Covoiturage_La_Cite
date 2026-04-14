/**
 * GET /api/platform-stats
 *
 * Retourne les statistiques publiques de la plateforme (Server Core).
 * Accessible sans authentification — utilisé par la page About.
 */
import { NextResponse } from 'next/server';
import { get } from '@/server/http-client';

interface PlatformStatsDto {
  totalUsers?: number;
  totalTrips?: number;
  totalCo2SavedKg?: number;
  computedAt?: string;
  data?: PlatformStatsDto;
}

const FALLBACK = { totalUsers: 0, totalTrips: 0, totalCo2SavedKg: 0, computedAt: new Date().toISOString() };

export async function GET() {
  try {
    const result = await get<PlatformStatsDto>('api/admin/platform-stats');

    if (!result.success) {
      return NextResponse.json(FALLBACK);
    }

    const raw = result.data as PlatformStatsDto;
    const data: PlatformStatsDto = raw?.data ?? raw;

    return NextResponse.json({
      totalUsers: data?.totalUsers ?? 0,
      totalTrips: data?.totalTrips ?? 0,
      totalCo2SavedKg: data?.totalCo2SavedKg ?? 0,
      computedAt: data?.computedAt ?? new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[api/platform-stats] GET error:', message);
    // Fallback graceful — la page About affiche 0 au lieu de crasher
    return NextResponse.json({
      totalUsers: 0,
      totalTrips: 0,
      totalCo2SavedKg: 0,
      computedAt: new Date().toISOString(),
    });
  }
}