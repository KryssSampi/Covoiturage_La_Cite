/**
 * POST /api/auth/signin
 * Authentification via email — recherche dans users.json
 * Retourne le UserModel core (sans champs sensibles)
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

interface CoreUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  initials: string;
  avatarUrl: string | null;
  phone?: string;
  role: string;
  canBeDriver: boolean;
  profileVerified: boolean;
  isActive: boolean;
  driverProfile?: unknown;
  passengerProfile?: unknown;
  preferences?: unknown;
  goScore?: number;
  badgeIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { email?: string };
    const email = body.email?.trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: 'Email requis' },
        { status: 400 }
      );
    }

    // Validation du domaine institutionnel
    if (!email.endsWith('@collegelacite.ca') && !email.endsWith('@la-citec.ca')) {
      return NextResponse.json(
        { error: 'Adresse email du Collège la Cité requise' },
        { status: 401 }
      );
    }

    const users = persistenceManager.readAll<CoreUser>('users');
    const user = users.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Compte désactivé' },
        { status: 403 }
      );
    }

    // Retourner l'utilisateur sans champs sensibles
    const { ...sanitized } = user;
    return NextResponse.json(sanitized);
  } catch {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
