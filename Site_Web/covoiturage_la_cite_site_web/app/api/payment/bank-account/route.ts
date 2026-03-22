/**
 * GET /api/payment/bank-account?userId=...
 *
 * Retourne le compte bancaire simulé d'un utilisateur.
 * Utilisé principalement pour l'affichage dans la section tests de FinancesPage.
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';
import type { BankAccountModel } from '@/core/models/BankAccountModel';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Paramètre userId requis' }, { status: 400 });
    }

    const accounts = persistenceManager.readAll<BankAccountModel>('bank_accounts');
    const account = accounts.find((a) => a.userId === userId);

    if (!account) {
      return NextResponse.json({ error: 'Compte bancaire introuvable' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
