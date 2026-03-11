/**
 * Connexion à la base de données PostgreSQL via un pool de connexions.
 * Utilise les variables d'environnement pour les informations de connexion.
 */
import { Pool, QueryResultRow } from 'pg';

// Instance unique du pool (singleton) pour éviter les connexions multiples
let pool: Pool | null = null;

/**
 * Retourne le pool de connexions PostgreSQL (crée une instance si elle n'existe pas encore).
 */
export function getPool(): Pool {
  if (!pool) {
    // Validation : DATABASE_URL doit être défini dans .env.local
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) {
      throw new Error(
        '[DB] DATABASE_URL est manquant. Vérifiez votre fichier .env.local et redémarrez le serveur Next.js.'
      );
    }

    // Supprime le paramètre sslmode de l'URL pour éviter les conflits avec l'option ssl
    // ci-dessous. Avec pg >= 8, sslmode=require dans l'URL est traité comme verify-full
    // et bloque les certificats auto-signés d'Aiven même avec rejectUnauthorized:false.
    const cleanUrl = rawUrl.replace(/[?&]sslmode=[^&]*/g, '').replace(/\?$/, '');

    pool = new Pool({
      // ⚠️ Ces valeurs proviennent du fichier .env.local — ne jamais hardcoder ici
      connectionString: cleanUrl,
      // SSL obligatoire pour les BD cloud (Aiven, Neon, Supabase, Railway…)
      // rejectUnauthorized: false accepte le certificat auto-signé d'Aiven
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    // Gestion des erreurs inattendues du pool
    pool.on('error', (err) => {
      console.error('[DB] Erreur inattendue sur le pool PostgreSQL :', err);
    });
  }

  return pool;
}

/**
 * Exécute une requête SQL avec le pool et retourne les lignes.
 * @param text - La requête SQL paramétrée
 * @param params - Les paramètres de la requête (prévention des injections SQL)
 */
export async function query<T extends QueryResultRow = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const db = getPool();
  const result = await db.query<T>(text, params);
  return result.rows;
}
