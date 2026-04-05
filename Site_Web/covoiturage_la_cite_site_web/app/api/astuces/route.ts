import { NextResponse } from 'next/server';
import { ContentService } from '@/server/services/ContentService';

/**
 * GET /api/astuces — Astuces actives depuis Server Core (MongoDB).
 * Route publique — pas d'auth requise.
 */
export async function GET() {
  try {
    const result = await ContentService.getAstuces();
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    return NextResponse.json(result.data ?? []);
  } catch {
    return NextResponse.json({ error: 'Impossible de lire les astuces' }, { status: 500 });
  }
}
