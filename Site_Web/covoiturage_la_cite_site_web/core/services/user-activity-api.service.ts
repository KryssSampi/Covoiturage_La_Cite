/**
 * user-activity-api.service.ts
 *
 * Service server-side pour la gestion de l'activité utilisateur.
 * Lit et écrit dans tests/db/user_activity.json via PersistenceManager.
 *
 * Usage : API routes Next.js uniquement (jamais côté client).
 */

import { generatePrefixedId, nowIso } from '@/core/utils/api-route.utils';
import { persistenceManager } from '@/tests/PersistenceManager';
import type { UserActivityModel, ConnectionRecord } from '@/core/models/UserActivityModel';

const ENTITY = 'user_activity' as const;
const MAX_HISTORY = 50;

// ─── Lecture ──────────────────────────────────────────────────────────────────

export function getActivityForUser(userId: string): UserActivityModel | null {
  const all = persistenceManager.readAll<UserActivityModel>(ENTITY);
  return all.find((a) => a.userId === userId) ?? null;
}

export function isUserConnectedOnWeb(userId: string): boolean {
  return getActivityForUser(userId)?.isCurrentlyConnectedOnWeb ?? false;
}

// ─── Connexion ────────────────────────────────────────────────────────────────

export function recordWebConnect(params: {
  userId: string;
  accountCreatedAt: string;
  userAgent?: string;
  location?: string;
  role?: string;
}): UserActivityModel {
  const { userId, accountCreatedAt, userAgent, location, role } = params;
  const now = nowIso();
  const newConnection: ConnectionRecord = {
    type: 'web',
    connectedAt: now,
    userAgent,
    location,
    role,
  };

  const existing = getActivityForUser(userId);

  if (existing) {
    const history = [newConnection, ...existing.connectionHistory].slice(0, MAX_HISTORY);
    const updated = persistenceManager.updateItem<UserActivityModel>(ENTITY, existing.id, {
      isCurrentlyConnectedOnWeb: true,
      lastSeenAt: now,
      connectionHistory: history,
    });
    return updated ?? existing;
  }

  // Première connexion — créer l'enregistrement
  const record: UserActivityModel = {
    id: generatePrefixedId('ACT'),
    userId,
    accountCreatedAt,
    lastSeenAt: now,
    isCurrentlyConnectedOnWeb: true,
    isCurrentlyConnectedOnMobile: false,
    connectionHistory: [newConnection],
  };
  persistenceManager.addItem(ENTITY, record);
  return record;
}

// ─── Déconnexion ──────────────────────────────────────────────────────────────

export function recordWebDisconnect(userId: string): void {
  const existing = getActivityForUser(userId);
  if (!existing) return;

  const now = nowIso();

  // Clore la dernière session web ouverte dans l'historique
  const history = existing.connectionHistory.map((c, i) =>
    i === 0 && c.type === 'web' && !c.disconnectedAt
      ? { ...c, disconnectedAt: now }
      : c,
  );

  persistenceManager.updateItem<UserActivityModel>(ENTITY, existing.id, {
    isCurrentlyConnectedOnWeb: false,
    lastSeenAt: now,
    connectionHistory: history,
  });
}

// ─── Ping / heartbeat ─────────────────────────────────────────────────────────

export function pingUserActivity(userId: string): void {
  const existing = getActivityForUser(userId);
  if (!existing) return;
  persistenceManager.updateItem<UserActivityModel>(ENTITY, existing.id, {
    lastSeenAt: nowIso(),
  });
}
