/**
 * POST /api/payment/withdraw
 * @body { driverId: string }
 *
 * Permet à un conducteur de transférer ses gains de son compte
 * DriverFinanceAccount vers son compte bancaire simulé.
 * Minimum de retrait : 20$.
 */
import { NextResponse } from 'next/server';
import { paymentService } from '@/server/services/PaymentService';

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { driverId?: string };

    if (!body.driverId) {
      return NextResponse.json({ error: 'Paramètre driverId requis' }, { status: 400 });
    }

    const result = paymentService.withdrawDriverToBank(body.driverId);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Retrait effectué avec succès',
      montantRetire: result.montant,
    });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
