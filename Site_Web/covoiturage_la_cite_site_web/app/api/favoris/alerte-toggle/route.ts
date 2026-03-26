import { NextResponse } from 'next/server';
import { deleteAlerte, toggleAlerte } from '@/core/services/favoris-api.service';

export async function PATCH(req: Request) {
  try {
    const { alerteId, surveyIsOn } = (await req.json()) as {
      alerteId?: string;
      surveyIsOn?: boolean;
    };

    if (!alerteId || typeof surveyIsOn !== 'boolean') {
      return NextResponse.json({ error: 'alerteId et surveyIsOn requis' }, { status: 400 });
    }

    return NextResponse.json(await toggleAlerte(alerteId, surveyIsOn));
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

    return NextResponse.json(await deleteAlerte(alerteId));
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
