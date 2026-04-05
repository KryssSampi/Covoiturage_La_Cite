import { NextResponse } from 'next/server';
import { UserService } from '@/server/services/UserService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const auth = await withAuth(req);
    const result = await UserService.getPublicProfile(id, auth);
    if (!result.success) return NextResponse.json({ error: result.message }, { status: 404 });
    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
