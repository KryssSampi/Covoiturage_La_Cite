import { NextResponse } from 'next/server';
import { ChatService } from '@/server/services/ChatService';
import { withAuth } from '@/server/auth';

/** POST /api/messages — Envoie un message */
export async function POST(req: Request) {
  try {
    const auth = await withAuth(req);
    const body = await req.json();
    const result = await ChatService.send(body, auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
    return NextResponse.json(result.data);
  } catch (err) {
    console.error('[api/messages]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
