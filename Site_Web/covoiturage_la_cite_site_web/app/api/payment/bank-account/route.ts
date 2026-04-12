/**
 * GET /api/payment/bank-account?userId=...
 *
 * Retourne le compte bancaire simulé d'un utilisateur.
 * Utilisé principalement pour l'affichage dans la section tests de FinancesPage.
 */
import { NextResponse } from 'next/server';
import { withAuth } from '@/server/auth';
import { persistenceManager } from '@/tests/PersistenceManager';
import type { BankAccountModel } from '@/core/models/BankAccountModel';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const userId = auth.userId;
    if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const accounts = persistenceManager.readAll<BankAccountModel>('bank_accounts');
    const account = accounts.find((a) => a.userId === userId);

    if (!account) {
      return NextResponse.json({ error: 'Compte bancaire introuvable' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (err) {
    console.error('[api/payment/bank-account]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
