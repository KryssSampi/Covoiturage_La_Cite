import { NextResponse } from 'next/server';
import { queryDrafts, saveDraft, type DraftRecord } from '@/core/services/draft-api.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const driverId = searchParams.get('driverId');
    return NextResponse.json(queryDrafts(driverId));
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as DraftRecord;
    const { draft, created, error, status } = saveDraft(body);

    if (!draft) {
      return NextResponse.json({ error }, { status: status ?? 400 });
    }

    return NextResponse.json(draft, { status: created ? 201 : 200 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
