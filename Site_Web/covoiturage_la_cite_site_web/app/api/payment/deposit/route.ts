/**
 * POST /api/payment/deposit
 * @body { userId: string; montant: number; description?: string }
 *
 * Dépôt de test : crédite directement le compte bancaire simulé d'un utilisateur.
 * ATTENTION : À usage de développement/test uniquement.
 *             À désactiver en production.
 */
import { NextResponse } from 'next/server';
import { paymentService } from '@/server/services/PaymentService';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      montant?: number;
      description?: string;
    };

    if (!body.userId || !body.montant || body.montant <= 0) {
      return NextResponse.json(
        { error: 'Paramètres userId et montant (> 0) requis' },
        { status: 400 }
      );
    }

    const description = body.description ?? `Dépôt de test — ${new Date().toLocaleDateString('fr-CA')}`;

    paymentService.depositToBank(body.userId, body.montant, description);

    return NextResponse.json({
      message: 'Dépôt effectué avec succès',
      userId: body.userId,
      montant: body.montant,
    });
  } catch (err) {
    console.error('[api/payment/deposit]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
