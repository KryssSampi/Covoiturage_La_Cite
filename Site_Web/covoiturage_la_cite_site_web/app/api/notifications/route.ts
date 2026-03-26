import { NextResponse } from 'next/server';
import { queryNotifications } from '@/core/services/notification-api.service';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    return NextResponse.json(queryNotifications(userId));
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
