/**
 * GET /api/sse/notifications?userId=X
 *
 * Endpoint SSE dédié aux notifications en temps réel d'un utilisateur spécifique.
 *
 * Comportement :
 * 1. Envoi immédiat du nombre de notifications non lues + la plus récente.
 * 2. À chaque écriture dans notifications.json, filtre par userId et pousse :
 *    - unreadCount : nombre de notifs non lues
 *    - latest : la notification la plus récente non lue (ou null)
 * 3. Heartbeat toutes les 30 s pour maintenir la connexion active.
 *
 * Le client peut ainsi afficher l'alerte toast sans poll.
 */

import { persistenceManager, dbEventEmitter } from '@/tests/PersistenceManager';
import type { NotificationModel } from '@/core/models/NotificationModel';

export const dynamic = 'force-dynamic';

function buildPayload(userId: string) {
  const all = persistenceManager.readAll<NotificationModel>('notifications');
  const mine = all.filter((n) => n.userId === userId);
  const unread = mine.filter((n) => !n.isRead);
  const latest = unread.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  )[0] ?? null;

  return { unreadCount: unread.length, latest };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return new Response('userId requis', { status: 400 });
  }

  // Active la surveillance fs.watch pour les notifications
  persistenceManager.watchEntity('notifications');

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      function send(eventName: string, data: unknown) {
        const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          /* stream fermé côté client */
        }
      }

      // Envoi immédiat de l'état actuel
      send('notification', buildPayload(userId));

      // Écoute les changements dans notifications.json
      function onChange() {
        send('notification', buildPayload(userId));
      }

      dbEventEmitter.on('change:notifications', onChange);

      // Heartbeat 30 s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30_000);

      // Nettoyage à la fermeture
      req.signal.addEventListener('abort', () => {
        dbEventEmitter.off('change:notifications', onChange);
        clearInterval(heartbeat);
        try { controller.close(); } catch { /* déjà fermé */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection:      'keep-alive',
    },
  });
}
