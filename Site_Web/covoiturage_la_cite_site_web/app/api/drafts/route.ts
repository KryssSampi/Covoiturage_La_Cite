/**
 * GET  /api/drafts     — Liste des brouillons
 * POST /api/drafts     — Créer/sauvegarder un brouillon
 * Délègue au Server Core
 */
import { NextResponse } from 'next/server';
import { DraftService } from '@/server/services/DraftService';
import { TripService } from '@/server/services/TripService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await DraftService.getDrafts(auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }

    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/drafts]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const auth = await withAuth(req);
    const body = await req.json();
    const tripId = body.tripId ?? body.id ?? 'new';

    const result = await TripService.saveDraft(tripId, body, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (err) {
    console.error('[api/drafts]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
