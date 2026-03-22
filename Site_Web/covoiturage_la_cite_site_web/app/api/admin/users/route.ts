/**
 * GET /api/admin/users
 *
 * Retourne la liste de tous les utilisateurs (sans les mots de passe).
 * Réservé à l'administration.
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

type UserRecord = Record<string, unknown>;

export async function GET() {
  try {
    const users = persistenceManager.readAll<UserRecord>('users');

    // Ne jamais exposer les mots de passe ou tokens sensibles
    const safeUsers = users.map(({ password, passwordHash, token, ...rest }) => {
      void password; void passwordHash; void token;
      return rest;
    });

    return NextResponse.json(safeUsers);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
