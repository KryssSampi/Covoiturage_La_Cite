/**
 * POST /api/payment/withdraw
 * Délègue au Server Core — POST api/finances/withdraw
 */
import { NextResponse } from 'next/server';
import { FinanceService } from '@/server/services/FinanceService';
import { withAuth } from '@/server/auth';

export async function POST(req: Request) {
  try {
    const auth = await withAuth(req);
    const body = (await req.json()) as { montant?: number; amount?: number };
    const amount = body.montant ?? body.amount;

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Montant requis et doit être supérieur à 0' }, { status: 400 });
    }

    const result = await FinanceService.requestWithdrawal({ amount }, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[POST /api/payment/withdraw]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
