import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// GET /api/sse/locations?tripId=X
// Diffuse en temps réel les positions du conducteur et des passagers d'un trajet.
// Fréquence : 2 s. Heartbeat : 25 s.

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tripId = searchParams.get('tripId');

  if (!tripId) {
    return NextResponse.json({ error: 'tripId requis' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  let closed = false;

  const stream = new ReadableStream({
    start(controller) {
      function send(data: unknown) {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
          );
        } catch {
          closed = true;
        }
      }

      function poll() {
        if (closed) return;
        try {
          const trip = persistenceManager.readById<Record<string, unknown>>(
            'trips',
            tripId,
          );
          if (!trip) {
            send({ error: 'trip introuvable' });
            return;
          }

          const driverId = trip.driverId as string;
          const passengerIds = (trip.passengerIds as string[]) ?? [];

          const driver = persistenceManager.readById<Record<string, unknown>>(
            'users',
            driverId,
          );
          const passengerPositions = passengerIds
            .map((pid) => {
              const u = persistenceManager.readById<Record<string, unknown>>(
                'users',
                pid,
              );
              if (!u) return null;
              return {
                userId: pid,
                pos: (u.currentLocation as { lat: number; lng: number } | null) ?? null,
              };
            })
            .filter(Boolean);

          send({
            driverPos:
              (driver?.currentLocation as { lat: number; lng: number } | null) ?? null,
            passengerPositions,
            alreadyOnTheirWay: trip.alreadyOnTheirWay ?? false,
            theyReallyEnd: trip.theyReallyEnd ?? false,
          });
        } catch {
          /* ignore les erreurs silencieuses */
        }
      }

      // Première diffusion immédiate, puis toutes les 2 s
      poll();
      const pollInterval = setInterval(poll, 2000);

      // Heartbeat pour maintenir la connexion SSE active
      const heartbeatInterval = setInterval(() => {
        if (!closed) {
          try {
            controller.enqueue(encoder.encode(': heartbeat\n\n'));
          } catch {
            closed = true;
          }
        }
      }, 25_000);

      req.signal.addEventListener('abort', () => {
        closed = true;
        clearInterval(pollInterval);
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch {
          /* already closed */
        }
      });
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
