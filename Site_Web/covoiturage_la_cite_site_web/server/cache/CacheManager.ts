/**
 * server/cache/CacheManager.ts — Cache hybride SQLite (persistant) + Map mémoire (rapide)
 *
 * Utilisé côté serveur Next.js uniquement (API routes, Server Components).
 * Évite les appels répétés au Server Core pour les données peu changeantes.
 *
 * Usage :
 *   CacheManager.get<T>('key')               → T | null
 *   CacheManager.set('key', data, ttlMs)
 *   CacheManager.invalidate('key')
 *   CacheManager.invalidatePattern('trips:*')
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// ── Config ────────────────────────────────────────────────────────────────────

const DB_DIR  = path.join(process.cwd(), '.cache');
const DB_PATH = path.join(DB_DIR, 'web_cache.sqlite3');

// Durées par défaut (ms)
export const TTL = {
  SHORT:    60_000,          //  1 min  — données temps réel
  MEDIUM:   5 * 60_000,      //  5 min  — données semi-statiques
  LONG:     30 * 60_000,     // 30 min  — données stables
  STATIC:   24 * 60 * 60_000 // 24 h   — assets statiques
} as const;

// ── Init SQLite ───────────────────────────────────────────────────────────────

function openDb(): Database.Database {
  if (!fs.existsSync(DB_DIR)) fs.mkdirSync(DB_DIR, { recursive: true });

  const db = new Database(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS cache (
      key        TEXT PRIMARY KEY,
      value      TEXT NOT NULL,
      expires_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_expires ON cache(expires_at);
  `);
  return db;
}

let _db: Database.Database | null = null;
function db(): Database.Database {
  if (!_db) _db = openDb();
  return _db;
}

// ── Cache mémoire (L1) ────────────────────────────────────────────────────────

const memCache = new Map<string, { value: unknown; expiresAt: number }>();

// ── API publique ──────────────────────────────────────────────────────────────

export const CacheManager = {
  get<T>(key: string): T | null {
    const now = Date.now();

    // L1 — mémoire
    const mem = memCache.get(key);
    if (mem && mem.expiresAt > now) return mem.value as T;
    memCache.delete(key);

    // L2 — SQLite
    try {
      const row = db().prepare('SELECT value, expires_at FROM cache WHERE key = ?').get(key) as
        { value: string; expires_at: number } | undefined;

      if (row && row.expires_at > now) {
        const parsed = JSON.parse(row.value) as T;
        memCache.set(key, { value: parsed, expiresAt: row.expires_at });
        return parsed;
      }
    } catch { /* SQLite indisponible */ }

    return null;
  },

  set<T>(key: string, value: T, ttlMs: number = TTL.MEDIUM): void {
    const expiresAt = Date.now() + ttlMs;

    // L1
    memCache.set(key, { value, expiresAt });

    // L2
    try {
      db().prepare(
        'INSERT OR REPLACE INTO cache (key, value, expires_at) VALUES (?, ?, ?)'
      ).run(key, JSON.stringify(value), expiresAt);
    } catch { /* SQLite indisponible */ }
  },

  invalidate(key: string): void {
    memCache.delete(key);
    try { db().prepare('DELETE FROM cache WHERE key = ?').run(key); } catch { /* */ }
  },

  invalidatePattern(pattern: string): void {
    const prefix = pattern.replace('*', '');
    for (const k of memCache.keys()) {
      if (k.startsWith(prefix)) memCache.delete(k);
    }
    try {
      db().prepare("DELETE FROM cache WHERE key LIKE ?").run(`${prefix}%`);
    } catch { /* */ }
  },

  /** Purge les entrées expirées (appeler périodiquement) */
  purgeExpired(): void {
    memCache.forEach((v, k) => { if (v.expiresAt <= Date.now()) memCache.delete(k); });
    try { db().prepare('DELETE FROM cache WHERE expires_at <= ?').run(Date.now()); } catch { /* */ }
  },
};
