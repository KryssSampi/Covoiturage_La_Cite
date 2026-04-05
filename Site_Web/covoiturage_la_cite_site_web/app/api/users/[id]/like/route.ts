import { NextResponse } from 'next/server';
import { post } from '@/server/http-client';
import { withAuth } from '@/server/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await withAuth(req);
    const result = await post<{ isLiked: boolean; count: number }>(`api/users/${id}/like`, undefined, auth);
    if (!result.success) return NextResponse.json({ error: result.message }, { status: 400 });
    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
