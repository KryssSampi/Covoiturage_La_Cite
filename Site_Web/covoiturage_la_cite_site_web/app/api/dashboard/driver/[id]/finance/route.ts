/**
 * GET /api/dashboard/driver/[id]/finance
 *
 * Route dédiée au résumé financier du conducteur.
 * Séparée de la route unifiée pour permettre un polling léger côté client
 * sans recharger l'ensemble du dashboard.
 *
 * Source de vérité : `driver_finance_accounts` (DriverFinanceAccountModel)
 * maintenu par PaymentService lors de chaque trajet complété.
 *
 * Mapping DriverFinanceAccountModel → DriverFinanceSummary :
 * - soldeDisponible     : soldeDisponible direct depuis DriverFinanceAccountModel
 * - weeklyProfit        : somme des transactions revenu/compensation confirmées cette semaine
 * - weeklyPendingProfit : soldeEnTransit (champ direct — trajets en cours non crédités)
 * - penalties           : soldePenalites (champ direct — §21 manifeste)
 * - currency            : 'CAD'
 */

import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';

import type { DriverFinanceAccountModel } from '@/core/models/DriverFinanceAccountModel';
import type { UserModel }                 from '@/core/models/UserModel';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: driverId } = await params;

    // Vérification de l'existence du conducteur
    const allUsers = persistenceManager.readAll<UserModel>('users');
    const driver   = allUsers.find((u) => u.id === driverId);
    if (!driver) {
      return NextResponse.json({ error: 'Conducteur introuvable' }, { status: 404 });
    }

    // Lecture du compte financier du conducteur depuis la source de vérité
    const allAccounts = persistenceManager.readAll<DriverFinanceAccountModel>('driver_finance_accounts');
    const account     = allAccounts.find((a) => a.driverId === driverId);

    // Si aucun compte n'existe encore (nouveau conducteur), on retourne des zéros
    if (!account) {
      return NextResponse.json({
        soldeDisponible:     0,
        currency:            'CAD',
        weeklyProfit:        0,
        weeklyPendingProfit: 0,
        penalties:           0,
      });
    }

    // Délimiteurs temporels pour les calculs périodiques
    const now          = new Date();
    const startOfWeek  = new Date(now);
    // Lundi comme premier jour de la semaine
    const dayOfWeek = now.getDay();
    startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    startOfWeek.setHours(0, 0, 0, 0);

    // Solde disponible : champ direct depuis DriverFinanceAccountModel (revenus nets après commission)
    const soldeDisponible = account.soldeDisponible;

    /**
     * Transactions de type revenu (revenu_trajet + compensation) confirmées.
     * Utilisées pour le calcul du gain hebdomadaire.
     */
    const revenueTransactions = account.transactions.filter(
      (t) => (t.type === 'revenu_trajet' || t.type === 'compensation') && t.statut === 'confirme'
    );

    // Gain hebdomadaire : revenus confirmés depuis lundi de la semaine courante
    const weeklyProfit = revenueTransactions
      .filter((t) => new Date(t.createdAt) >= startOfWeek)
      .reduce((sum, t) => sum + t.montant, 0);

    // En transit : montant des trajets en cours (champ direct — maintenu par PaymentService)
    const weeklyPendingProfit = account.soldeEnTransit;

    // Pénalités actives : champ direct (maintenu par PaymentService — §21 manifeste)
    const penalties = account.soldePenalites;

    return NextResponse.json({
      soldeDisponible:     parseFloat(soldeDisponible.toFixed(2)),
      currency:            'CAD',
      weeklyProfit:        parseFloat(weeklyProfit.toFixed(2)),
      weeklyPendingProfit: parseFloat(weeklyPendingProfit.toFixed(2)),
      penalties:           parseFloat(penalties.toFixed(2)),
    });

  } catch (err) {
    console.error('[GET /api/dashboard/driver/finance]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
