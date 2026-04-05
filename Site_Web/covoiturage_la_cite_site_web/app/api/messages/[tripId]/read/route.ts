import { NextResponse } from 'next/server';
import { ChatService } from '@/server/services/ChatService';
import { withAuth } from '@/server/auth';

/** PATCH /api/messages/[tripId]/read — Marque la conversation comme lue */
export async function PATCH(req: Request, { params }: { params: Promise<{ tripId: string }> }) {
  try {
    const { tripId } = await params;
    const auth = await withAuth(req);
    const result = await ChatService.markRead(tripId, auth);
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
