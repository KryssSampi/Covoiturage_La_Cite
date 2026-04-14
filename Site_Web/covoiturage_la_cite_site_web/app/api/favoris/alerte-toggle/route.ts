import { NextResponse } from 'next/server';
import { toggleAlerte, deleteAlerte } from '@/core/services/favoris-api.service';
import { withAuth } from '@/server/auth';

export async function PATCH(req: Request) {
  try {
    const auth = await withAuth(req);
    if (!auth.token) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const { alerteId, surveyIsOn } = (await req.json()) as { alerteId?: string; surveyIsOn?: boolean };

    if (!alerteId || surveyIsOn === undefined) {
      return NextResponse.json({ error: 'alerteId et surveyIsOn requis' }, { status: 400 });
    }

    const result = await toggleAlerte(alerteId, surveyIsOn, { token: auth.token });
    if (!result.success) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/favoris/alerte-toggle]', err);
    console.error('[API] PATCH /api/favoris/alerte-toggle - erreur');
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const auth = await withAuth(req);
    if (!auth.token) {
      return NextResponse.json({ error: 'Non authentifie' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const alerteId = searchParams.get('alerteId');

    if (!alerteId) {
      return NextResponse.json({ error: 'alerteId requis' }, { status: 400 });
    }

    const result = await deleteAlerte(alerteId, { token: auth.token });
    if (!result.success) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/favoris/alerte-toggle]', err);
    console.error('[API] DELETE /api/favoris/alerte-toggle - erreur');
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
