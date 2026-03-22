/**
 * GET /api/sse/db-watch/[entity]
 *
 * Endpoint Server-Sent Events (SSE) — publie les modifications d'un fichier
 * JSON de la base de test en temps réel.
 *
 * Le JsonStorageManager surveille les fichiers via fs.watch et détecte :
 * - Les écritures internes (PersistenceManager.writeAll, addItem, updateItem…)
 * - Les modifications manuelles (édition directe du fichier JSON)
 *
 * Le client ouvre une connexion EventSource vers cette route et reçoit
 * un événement 'update' à chaque changement du contenu du fichier.
 *
 * Sécurité : seules les entités de la liste blanche AllowedEntity sont
 * autorisées. Toute autre valeur retourne un 400.
 */

import { persistenceManager, dbEventEmitter } from '@/tests/PersistenceManager';
import type { AllowedEntity } from '@/tests/PersistenceManager';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ entity: string }> }
) {
  const { entity } = await params;

  // Validation : l'entité doit être dans la liste blanche
  if (!persistenceManager.isAllowed(entity)) {
    return new Response(`Entité "${entity}" non autorisée`, { status: 400 });
  }

  // Active la surveillance fs.watch pour cette entité
  persistenceManager.watchEntity(entity as AllowedEntity);

  // Envoi du contenu initial immédiat + flux SSE pour les mises à jour
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      /** Envoie un événement SSE formaté au client */
      function send(eventName: string, data: unknown) {
        const payload = `event: ${eventName}\ndata: ${JSON.stringify(data)}\n\n`;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          // Le stream a été fermé côté client — on ignore silencieusement
        }
      }

      // Envoi immédiat du contenu actuel pour que le client ait des données dès la connexion
      try {
        const initial = persistenceManager.readAll(entity as AllowedEntity);
        send('update', initial);
      } catch {
        send('error', { message: `Impossible de lire ${entity}` });
      }

      // Écoute les changements publiés par JsonStorageManager
      function onChange(data: unknown) {
        send('update', data);
      }

      dbEventEmitter.on(`change:${entity}`, onChange);

      // Heartbeat toutes les 30 s pour maintenir la connexion active
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': heartbeat\n\n'));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30_000);

      // Nettoyage lorsque le client ferme la connexion
      _req.signal.addEventListener('abort', () => {
        dbEventEmitter.off(`change:${entity}`, onChange);
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
