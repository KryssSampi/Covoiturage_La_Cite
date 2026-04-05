import { NextResponse } from 'next/server';
import { ChatService } from '@/server/services/ChatService';
import { withAuth } from '@/server/auth';

/** GET /api/messages/unread-count — Nombre total de messages non lus */
export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await ChatService.getUnreadCount(auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json({ count: result.data ?? 0 });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
