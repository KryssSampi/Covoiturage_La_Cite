/**
 * PersistenceManager — Seul singleton autorisé à modifier les fichiers JSON
 *
 * Toutes les écritures dans tests/db/*.json passent OBLIGATOIREMENT par lui.
 * Aucun autre module ne doit instancier JsonStorageManager directement.
 *
 * Usage côté serveur (API routes Next.js) uniquement :
 *   import { persistenceManager } from '@/tests/PersistenceManager';
 */
import { JsonStorageManager } from './JsonStorageManager';

// Réexporte l'émetteur d'événements pour usage dans les routes SSE
export { dbEventEmitter } from './JsonStorageManager';

/** Entités JSON autorisées — liste blanche anti-traversée de chemin */
export type AllowedEntity =
  | 'users'
  | 'trips'
  | 'reservations'
  | 'vehicles'
  | 'notifications'
  | 'messages'
  | 'reviews'
  | 'drafts'
  | 'bank_accounts'
  | 'driver_finance_accounts'
  | 'passenger_finance_accounts'
  | 'penalites'
  | 'lieux_favoris'
  | 'affinites'
  | 'user_preferences'
  | 'gotasks'
  | 'goevents'
  | 'goboard_classement'
  | 'eco_challenges'
  | 'astuces'
  | 'nouveautes'
  | 'indisponibilities'
  | 'badges'
  | 'user_stats'
  | 'user_activity';

export class PersistenceManager {
  private static _instance: PersistenceManager;
  private readonly storage: JsonStorageManager;

  static readonly ALLOWED_ENTITIES: AllowedEntity[] = [
    'users',
    'trips',
    'reservations',
    'vehicles',
    'notifications',
    'messages',
    'reviews',
    'drafts',
    'bank_accounts',
    'driver_finance_accounts',
    'passenger_finance_accounts',
    'penalites',
    'lieux_favoris',
    'affinites',
    'user_preferences',
    'gotasks',
    'goevents',
    'goboard_classement',
    'eco_challenges',
    'astuces',
    'nouveautes',
    'indisponibilities',
    'badges',
    'user_stats',
    'user_activity',
  ];

  private constructor() {
    this.storage = new JsonStorageManager();
  }

  static getInstance(): PersistenceManager {
    if (!PersistenceManager._instance) {
      PersistenceManager._instance = new PersistenceManager();
    }
    return PersistenceManager._instance;
  }

  /** Vérifie si l'entité est dans la liste blanche */
  isAllowed(entity: string): entity is AllowedEntity {
    return (PersistenceManager.ALLOWED_ENTITIES as string[]).includes(entity);
  }

  /** Lit toutes les entrées d'une entité */
  readAll<T>(entity: AllowedEntity): T[] {
    return this.storage.read<T[]>(entity);
  }

  /** Remplace toutes les entrées d'une entité (opération atomique) */
  writeAll<T>(entity: AllowedEntity, data: T[]): void {
    this.storage.write(entity, data);
  }

  /** Ajoute un élément à la fin de la liste */
  addItem<T>(entity: AllowedEntity, item: T): T {
    const all = this.readAll<T>(entity);
    this.writeAll(entity, [...all, item]);
    return item;
  }

  /** Met à jour un élément par son id — injecte updatedAt automatiquement */
  updateItem<T>(entity: AllowedEntity, id: string, patch: Partial<T>): T | null {
    const all = this.readAll<T & { id: string }>(entity);
    const idx = all.findIndex((i) => i.id === id);
    if (idx === -1) return null;
    const updated = {
      ...all[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    } as T & { id: string };
    const next = [...all];
    next[idx] = updated;
    this.writeAll(entity, next);
    return updated as T;
  }

  /** Supprime un élément par son id — retourne false si introuvable */
  deleteItem<T = unknown>(entity: AllowedEntity, id: string): boolean {
    const all = this.readAll<(T & { id: string })>(entity);
    const filtered = all.filter((i) => i.id !== id);
    if (filtered.length === all.length) return false;
    this.writeAll(entity, filtered);
    return true;
  }

  /** Lit un élément par son id — null si introuvable */
  readById<T = unknown>(entity: AllowedEntity, id: string): T | null {
    const all = this.readAll<T & { id: string }>(entity);
    return all.find((i) => i.id === id) as T ?? null;
  }

  /**
   * Active la surveillance fichier (fs.watch) pour une entité.
   * Les changements (internes ou manuels) déclenchent un événement
   * 'change:<entity>' sur dbEventEmitter.
   */
  watchEntity(entity: AllowedEntity): void {
    this.storage.watch(entity);
  }
}

/** Instance singleton exportée — usage server-side uniquement */
export const persistenceManager = PersistenceManager.getInstance();
