import { NextResponse } from 'next/server';
import { post } from '@/server/http-client';
import { withAuth } from '@/server/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await withAuth(req);
    const body = await req.json();
    const result = await post(`api/users/${id}/survey-alert`, body, auth);
    if (!result.success) return NextResponse.json({ error: result.message }, { status: 400 });
    return NextResponse.json(result.data, { status: 201 });
  } catch (err) {
    console.error('[api/users/[id]/survey-alert]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
