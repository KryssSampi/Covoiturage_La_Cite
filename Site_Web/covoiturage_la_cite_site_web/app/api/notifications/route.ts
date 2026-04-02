import { NextResponse } from 'next/server';
import { NotificationService } from '@/server/services/NotificationService';
import { withAuth } from '@/server/auth';

export async function GET(req: Request) {
  try {
    const auth = await withAuth(req);
    const result = await NotificationService.getAll(1, 50, auth);

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json(result.data);
  } catch {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
