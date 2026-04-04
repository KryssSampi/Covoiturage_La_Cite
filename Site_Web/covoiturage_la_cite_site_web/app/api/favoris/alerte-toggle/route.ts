import { NextResponse } from 'next/server';
import { toggleAlerte, deleteAlerte } from '@/core/services/favoris-api.service';

export async function PATCH(req: Request) {
  try {
    const { alerteId, surveyIsOn } = (await req.json()) as { alerteId?: string; surveyIsOn?: boolean };

    if (!alerteId || surveyIsOn === undefined) {
      return NextResponse.json({ error: 'alerteId et surveyIsOn requis' }, { status: 400 });
    }

    const result = await toggleAlerte(alerteId, surveyIsOn);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const alerteId = searchParams.get('alerteId');

    if (!alerteId) {
      return NextResponse.json({ error: 'alerteId requis' }, { status: 400 });
    }

    const result = await deleteAlerte(alerteId);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
