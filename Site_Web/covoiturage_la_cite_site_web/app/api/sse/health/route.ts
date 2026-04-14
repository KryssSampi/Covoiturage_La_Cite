/**
 * GET /api/sse/health
 *
 * Health-check du service SSE côté Server Core.
 * Ne nécessite pas d'authentification.
 * Permet de vérifier si le Server Core SSE est disponible avant d'ouvrir un flux.
 */

import { NextResponse } from 'next/server';
import { SERVER_CORE_URL } from '@/server/config';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const coreUrl = `${SERVER_CORE_URL}/api/sse/health`;
    const response = await fetch(coreUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { status: 'error', message: `Server Core health check failed: ${response.status}` },
        { status: 503 },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[api/sse/health]', err);
    return NextResponse.json(
      { status: 'error', message: 'Server Core SSE unreachable' },
      { status: 503 },
    );
  }
}
