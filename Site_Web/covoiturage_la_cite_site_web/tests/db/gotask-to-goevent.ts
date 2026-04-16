/**
 * GoTaskToGoEvent — Convertisseur automatique GoTask → GoEvent.
 *
 * Écoute les changements sur l'entité 'gotasks' via dbEventEmitter.
 * Lorsqu'une progression est marquée isDone = true avec un completeAt,
 * un GoEvent correspondant est automatiquement créé dans goevents.json
 * (s'il n'existe pas déjà pour cette combinaison task + user).
 *
 * Usage : importer ce module une seule fois au démarrage du serveur (ex. dans l'API route goboard).
 */
import { persistenceManager, dbEventEmitter } from '@/tests/PersistenceManager';
import type { GoTask, GoEvent } from '@/features/goboard/types/goboard.types';

/** Génère un id GoEvent déterministe à partir de la GoTask et du userId */
function makeGoEventId(taskId: string, userId: string): string {
  return `GE-${taskId}-${userId}`;
}

/** Convertit une GoTask complétée en GoEvent */
export function convertGoTaskToGoEvent(task: GoTask, userId: string, completeAt: string): GoEvent {
  return {
    id: makeGoEventId(task.id, userId),
    titre: `Go!Tâche complétée — ${task.titleFr}`,
    date: completeAt,
    points: task.points,
    utilisateurId: userId,
  };
}

/** Synchronise les GoEvents à partir de l'état actuel des GoTasks */
export function syncGoEventsFromTasks(): void {
  const tasks = persistenceManager.readAll<GoTask>('gotasks');
  const existingEvents = persistenceManager.readAll<GoEvent>('goevents');
  const existingIds = new Set(existingEvents.map((e) => e.id));

  const newEvents: GoEvent[] = [];

  for (const task of tasks) {
    for (const prog of (task.progression ?? [])) {
      if (prog.isDone && prog.completeAt) {
        const eventId = makeGoEventId(task.id, prog.userId);
        if (!existingIds.has(eventId)) {
          newEvents.push(convertGoTaskToGoEvent(task, prog.userId, prog.completeAt));
        }
      }
    }
  }

  if (newEvents.length > 0) {
    persistenceManager.writeAll('goevents', [...existingEvents, ...newEvents]);
  }
}

/** Démarre le listener sur les changements de gotasks */
let _initialized = false;
export function initGoTaskListener(): void {
  if (_initialized) return;
  _initialized = true;

  // Synchronisation initiale au démarrage
  syncGoEventsFromTasks();

  // Écoute les futures modifications des gotasks
  dbEventEmitter.on('change:gotasks', () => {
    syncGoEventsFromTasks();
  });
}
