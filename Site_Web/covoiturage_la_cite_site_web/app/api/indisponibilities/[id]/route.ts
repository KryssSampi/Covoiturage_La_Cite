import { NextResponse } from 'next/server';
import type { IndisponibilityDateRange, IndisponibilityModel } from '@/core/models/IndisponibilityModel';
import { getOrCreateEmptyIndisponibility, saveIndisponibility } from '@/core/services/indisponibility-api.service';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    return NextResponse.json(getOrCreateEmptyIndisponibility(id) satisfies IndisponibilityModel);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = (await req.json()) as Partial<IndisponibilityModel>;
    const dates = Array.isArray(body.dates) ? (body.dates as IndisponibilityDateRange[]) : [];
    const { record, created } = saveIndisponibility(id, dates);
    return NextResponse.json(record, { status: created ? 201 : 200 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
