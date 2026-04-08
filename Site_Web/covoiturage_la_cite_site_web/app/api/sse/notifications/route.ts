/**
 * GET /api/sse/notifications
 *
 * Proxy SSE réel vers le Server Core (GET /api/sse/notifications).
 * Transmet le JWT du cookie sc_token dans l'header Authorization du Server Core.
 * Événements relayés au client web :
 *   - "notification" : NotificationResponseDto
 *   - "ping"         : heartbeat toutes les 25 s
 *
 * Le client ouvre : new EventSource('/api/sse/notifications')
 * (les cookies sont transmis automatiquement — le JWT est extrait côté BFF)
 */

import { NextRequest } from 'next/server';
import { SERVER_CORE_URL } from '@/server/config';
import { extractToken } from '@/server/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const token = await extractToken(req);

  if (!token) {
    return new Response(
      'event: error\ndata: {"error":"Non autorisé"}\n\n',
      {
        status: 401,
        headers: { 'Content-Type': 'text/event-stream' },
      },
    );
  }

  // Connexion vers Server Core SSE
  const coreUrl = `${SERVER_CORE_URL}/api/sse/notifications`;
  let coreResponse: Response;

  try {
    coreResponse = await fetch(coreUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
      // @ts-expect-error — duplex requis par fetch pour les streams
      duplex: 'half',
      signal: req.signal,
    });
  } catch (err) {
    console.error('[api/sse/notifications] Server Core unreachable:', err);
    return new Response(
      'event: error\ndata: {"error":"Server Core inaccessible","code":"SSE_UNAVAILABLE"}\n\n',
      {
        status: 503,
        headers: { 'Content-Type': 'text/event-stream' },
      },
    );
  }

  if (!coreResponse.ok || !coreResponse.body) {
    const status = coreResponse.status;
    const errorData = JSON.stringify({
      error: status === 401 ? 'Session expirée' : `Server Core SSE ${status}`,
      code: status === 401 ? 'SSE_UNAUTHORIZED' : 'SSE_ERROR',
      httpStatus: status,
    });

    console.error(`[api/sse/notifications] Server Core responded ${status}`);

    return new Response(
      `event: error\ndata: ${errorData}\n\n`,
      {
        status: status === 401 ? 401 : 502,
        headers: { 'Content-Type': 'text/event-stream' },
      },
    );
  }

  // Relay du flux SSE Server Core → client web
  const stream = new ReadableStream({
    async start(controller) {
      const reader = coreResponse.body!.getReader();
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          controller.enqueue(value);
        }
      } catch (err) {
    console.error('[api/sse/notifications]', err);
        // client déconnecté ou signal abort
      } finally {
        reader.releaseLock();
        controller.close();
      }
    },
    cancel() {
      coreResponse.body?.cancel();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
