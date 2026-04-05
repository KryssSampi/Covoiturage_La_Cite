import { NextResponse } from 'next/server';
import { ChatService } from '@/server/services/ChatService';
import { withAuth } from '@/server/auth';

/** GET /api/messages/[tripId]?page=1&pageSize=50 — Historique paginé d'une conversation */
export async function GET(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  try {
    const { tripId } = await params;
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') ?? '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') ?? '50', 10);

    const auth = await withAuth(req);
    const result = await ChatService.getConversation(tripId, page, pageSize, auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json(result.data ?? []);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
