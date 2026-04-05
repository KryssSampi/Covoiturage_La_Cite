import { NextResponse } from 'next/server';
import { ChatService } from '@/server/services/ChatService';
import { withAuth } from '@/server/auth';

/** GET /api/messages/conversations — Liste des conversations actives */
export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await ChatService.getConversations(auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json(result.data ?? []);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
