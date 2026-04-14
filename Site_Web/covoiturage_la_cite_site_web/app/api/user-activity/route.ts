/**
 * POST /api/user-activity   — signale connect/disconnect
 * GET  /api/user-activity   — lit l'activité d'un utilisateur
 *
 * Body POST : { userId, action: 'connect'|'disconnect', accountCreatedAt?, userAgent?, location? }
 */

import { NextResponse } from 'next/server';
import { withAuth } from '@/server/auth';
import {
  recordWebConnect,
  recordWebDisconnect,
  getActivityForUser,
} from '@/core/services/user-activity-api.service';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const userId = auth.userId;
    if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const activity = getActivityForUser(userId);
    return NextResponse.json(activity ?? { userId, isCurrentlyConnectedOnWeb: false });
  } catch (err) {
    console.error('[api/user-activity]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      userId?: string;
      action?: 'connect' | 'disconnect';
      accountCreatedAt?: string;
      userAgent?: string;
      location?: string;
      role?: string;
    };
    const auth = await withAuth(req);
    const userId = auth.userId;
    const action = body.action;
    if (!userId || !action) {
      return NextResponse.json({ error: 'Non authentifié ou action manquante' }, { status: 400 });
    }

    if (action === 'connect') {
      const record = recordWebConnect({
        userId,
        accountCreatedAt: body.accountCreatedAt ?? new Date().toISOString(),
        userAgent: body.userAgent,
        location: body.location,
        role: body.role,
      });
      return NextResponse.json(record);
    }

    if (action === 'disconnect') {
      recordWebDisconnect(userId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'action invalide (connect|disconnect)' }, { status: 400 });
  } catch (err) {
    console.error('[api/user-activity]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
