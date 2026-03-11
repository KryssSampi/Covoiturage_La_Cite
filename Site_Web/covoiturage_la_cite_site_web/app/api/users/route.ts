/**
 * Route API : GET /api/users
 * Récupère la liste de tous les utilisateurs depuis la base de données PostgreSQL.
 * Cette route est destinée à l'usage admin uniquement.
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { UserModel } from '@/domain/models/UserModel';

export async function GET() {
  try {
    // Requête SQL : récupère les colonnes nécessaires pour la liste admin
    // Les mots de passe ou tokens secrets ne sont JAMAIS sélectionnés
    const users = await query<UserModel>(`
      SELECT
        id,
        email,
        nom,
        prenom,
        role,
        is_active,
        profile_verified,
        photo_url,
        created_at,
        dernier_login
      FROM users
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    // Affiche le message précis dans la console du serveur Next.js pour faciliter le débogage
    const message = error instanceof Error ? error.message : String(error);
    console.error('[API /users] Erreur :', message);

    return NextResponse.json(
      {
        error: 'Impossible de récupérer les utilisateurs.',
        // Le détail est renvoyé uniquement en développement (jamais en production)
        detail: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}
