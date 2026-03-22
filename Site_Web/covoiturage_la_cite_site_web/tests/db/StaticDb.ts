/**
 * StaticDb — Gestionnaire de la base de données statique locale
 *
 * Chargement côté client uniquement via fetch vers les API routes /api/db/*.
 * La persistence réelle est assurée côté serveur dans tests/db/*.json.
 *
 * Usage :
 *   const db = StaticDb.getInstance();
 *   const trips = await db.get<TripModel[]>('trips');
 *   await db.save('trips', updatedTrips);
 */

import type { TripModel } from '@/core/models/TripModel';
import type { ReservationModel } from '@/core/models/ReservationModel';
import type { UserModel } from '@/core/models/UserModel';
import type { VehicleModel } from '@/core/models/VehicleModel';
import type { NotificationModel } from '@/core/models/NotificationModel';
import type { MessageModel } from '@/core/models/MessageModel';
import type { ReviewModel } from '@/core/models/ReviewModel';
import type { DraftTrip } from '@/features/brouillons/types';

// ─── Types de la base de données ─────────────────────────────────────────────

export interface DbSchema {
  users: UserModel[];
  trips: TripModel[];
  reservations: ReservationModel[];
  vehicles: VehicleModel[];
  notifications: NotificationModel[];
  messages: MessageModel[];
  reviews: ReviewModel[];
  drafts: DraftTrip[];
}

export type DbEntity = keyof DbSchema;

// ─── Classe principale ────────────────────────────────────────────────────────

/**
 * StaticDb — Singleton d'accès à la base de données JSON locale
 * Communique via les API routes /api/db/[entity]
 */
export class StaticDb {
  private static instance: StaticDb;
  /** Cache en mémoire pour éviter les requêtes répétées */
  private cache = new Map<DbEntity, unknown>();

  private constructor() {}

  static getInstance(): StaticDb {
    if (!StaticDb.instance) {
      StaticDb.instance = new StaticDb();
    }
    return StaticDb.instance;
  }

  /** Invalide le cache d'une entité (force le rechargement) */
  invalidate(entity: DbEntity): void {
    this.cache.delete(entity);
  }

  /** Invalide tout le cache */
  invalidateAll(): void {
    this.cache.clear();
  }

  /**
   * Récupère toutes les entrées d'une entité
   * Utilise le cache si disponible, sinon fetch l'API route
   */
  async getAll<K extends DbEntity>(entity: K): Promise<DbSchema[K]> {
    if (this.cache.has(entity)) {
      return this.cache.get(entity) as DbSchema[K];
    }

    const res = await fetch(`/api/db/${entity}`, { cache: 'no-store' });
    if (!res.ok) {
      throw new Error(`[StaticDb] Erreur GET /${entity}: ${res.status}`);
    }

    const data = (await res.json()) as DbSchema[K];
    this.cache.set(entity, data);
    return data;
  }

  /**
   * Récupère une entrée par son id
   */
  async getById<K extends DbEntity>(
    entity: K,
    id: string
  ): Promise<DbSchema[K][number] | null> {
    const all = await this.getAll(entity);
    const item = (all as { id: string }[]).find((i) => i.id === id);
    return (item as DbSchema[K][number]) ?? null;
  }

  /**
   * Écrit l'ensemble des données d'une entité (remplace tout)
   * Invalide le cache après écriture
   */
  async saveAll<K extends DbEntity>(entity: K, data: DbSchema[K]): Promise<void> {
    const res = await fetch(`/api/db/${entity}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      throw new Error(`[StaticDb] Erreur PUT /${entity}: ${res.status}`);
    }

    this.cache.set(entity, data);
  }

  /**
   * Ajoute un élément à une entité
   */
  async add<K extends DbEntity>(
    entity: K,
    item: DbSchema[K][number]
  ): Promise<void> {
    const all = await this.getAll(entity);
    const updated = [...(all as unknown[]), item] as DbSchema[K];
    await this.saveAll(entity, updated);
  }

  /**
   * Met à jour un élément par son id
   */
  async updateById<K extends DbEntity>(
    entity: K,
    id: string,
    patch: Partial<DbSchema[K][number]>
  ): Promise<void> {
    const all = await this.getAll(entity);
    const updated = (all as { id: string }[]).map((item) =>
      item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item
    ) as DbSchema[K];
    await this.saveAll(entity, updated);
  }

  /**
   * Supprime un élément par son id
   */
  async deleteById<K extends DbEntity>(entity: K, id: string): Promise<void> {
    const all = await this.getAll(entity);
    const updated = (all as { id: string }[]).filter((i) => i.id !== id) as DbSchema[K];
    await this.saveAll(entity, updated);
  }
}

/** Instance singleton exportée pour usage direct */
export const staticDb = StaticDb.getInstance();
