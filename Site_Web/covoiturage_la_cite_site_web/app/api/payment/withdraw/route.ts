/**
 * POST /api/payment/withdraw
 * @body { driverId: string, montant?: number, bankAccountId?: string }
 *
 * Permet à un conducteur de transférer ses gains de son compte
 * DriverFinanceAccount vers un compte bancaire spécifique.
 * Si montant est omis, retrait total du solde disponible.
 * Si bankAccountId est omis, utilise le premier compte trouvé.
 * Minimum de retrait : 20$.
 */
import { NextResponse } from 'next/server';
import { persistenceManager } from '@/tests/PersistenceManager';
import type { BankAccountModel, BankAccountTransaction } from '@/core/models/BankAccountModel';
import type { DriverFinanceAccountModel, DriverFinanceTransaction } from '@/core/models/DriverFinanceAccountModel';

/** Seuil minimum pour un retrait conducteur */
const RETRAIT_MIN = 20.00;

function genId(prefix: string): string {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(10000 + Math.random() * 90000));
  return `${prefix}-${year}-${rand}`;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      driverId?: string;
      montant?: number;
      bankAccountId?: string;
    };

    if (!body.driverId) {
      return NextResponse.json({ error: 'Paramètre driverId requis' }, { status: 400 });
    }

    // Lecture du compte conducteur
    const dfAccounts = persistenceManager.readAll<DriverFinanceAccountModel>('driver_finance_accounts');
    const dfIdx = dfAccounts.findIndex((a) => a.driverId === body.driverId);

    if (dfIdx === -1) {
      return NextResponse.json({ error: 'Compte conducteur introuvable' }, { status: 404 });
    }

    const df = dfAccounts[dfIdx];

    // Détermination du montant à retirer
    const montant = body.montant != null ? body.montant : df.soldeDisponible;

    // Validations
    if (montant <= 0 || isNaN(montant)) {
      return NextResponse.json({ error: 'Le montant doit être supérieur à 0 $' }, { status: 400 });
    }

    if (montant > df.soldeDisponible) {
      return NextResponse.json(
        { error: `Montant demandé (${montant.toFixed(2)} $) supérieur au solde disponible (${df.soldeDisponible.toFixed(2)} $)` },
        { status: 400 },
      );
    }

    if (montant < RETRAIT_MIN) {
      return NextResponse.json(
        { error: `Le montant minimum de retrait est de ${RETRAIT_MIN.toFixed(2)} $` },
        { status: 400 },
      );
    }

    if (df.soldePenalites > 0) {
      return NextResponse.json(
        { error: 'Litige de pénalité en cours — retrait bloqué' },
        { status: 400 },
      );
    }

    // Solde restant après retrait
    const soldeRestant = df.soldeDisponible - montant;
    if (soldeRestant > 0 && soldeRestant < RETRAIT_MIN) {
      return NextResponse.json(
        { error: `Le solde restant après retrait serait de ${soldeRestant.toFixed(2)} $ — insuffisant pour un prochain retrait (min. ${RETRAIT_MIN.toFixed(2)} $). Retirez la totalité ou ajustez le montant.` },
        { status: 400 },
      );
    }

    // Recherche du compte bancaire cible
    const bankAccounts = persistenceManager.readAll<BankAccountModel>('bank_accounts');
    let bankIdx: number;

    if (body.bankAccountId) {
      bankIdx = bankAccounts.findIndex((a) => a.id === body.bankAccountId && a.userId === body.driverId);
      if (bankIdx === -1) {
        return NextResponse.json({ error: 'Compte bancaire introuvable ou non associé à cet utilisateur' }, { status: 404 });
      }
    } else {
      bankIdx = bankAccounts.findIndex((a) => a.userId === body.driverId);
      if (bankIdx === -1) {
        return NextResponse.json({ error: 'Aucun compte bancaire enregistré pour cet utilisateur' }, { status: 404 });
      }
    }

    const now = new Date().toISOString();

    // Débit du DriverFinanceAccount
    const txnDF: DriverFinanceTransaction = {
      id: genId('DTXN'),
      type: 'retrait_banque',
      montant,
      description: `Retrait de ${montant.toFixed(2)} $ vers ${bankAccounts[bankIdx].nomBanque} ${bankAccounts[bankIdx].ibanMasque}`,
      statut: 'confirme',
      createdAt: now,
    };
    dfAccounts[dfIdx] = {
      ...df,
      soldeDisponible: parseFloat(soldeRestant.toFixed(2)),
      transactions: [...df.transactions, txnDF],
      updatedAt: now,
    };
    persistenceManager.writeAll('driver_finance_accounts', dfAccounts);

    // Crédit du BankAccount
    const acc = bankAccounts[bankIdx];
    const txnBank: BankAccountTransaction = {
      id: genId('BTXN'),
      type: 'depot',
      montant,
      description: `Retrait depuis Cité-Voiturage — ${montant.toFixed(2)} $`,
      statut: 'complete',
      createdAt: now,
    };
    bankAccounts[bankIdx] = {
      ...acc,
      soldeDisponible: parseFloat((acc.soldeDisponible + montant).toFixed(2)),
      transactions: [...acc.transactions, txnBank],
      updatedAt: now,
    };
    persistenceManager.writeAll('bank_accounts', bankAccounts);

    return NextResponse.json({
      message: `Retrait de ${montant.toFixed(2)} $ effectué avec succès vers ${acc.nomBanque} ${acc.ibanMasque}`,
      montantRetire: montant,
      soldeRestant: parseFloat(soldeRestant.toFixed(2)),
      bankAccountId: acc.id,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
