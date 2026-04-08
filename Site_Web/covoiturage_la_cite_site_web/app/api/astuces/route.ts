import { NextResponse } from 'next/server';
import { ContentService } from '@/server/services/ContentService';
import { astuceResponseDtosToTips } from '@/features/dashboard/converters/tip.converter';

/**
 * GET /api/astuces — Astuces actives depuis Server Core (MongoDB).
 * Route publique — pas d'auth requise.
 *
 * Pipeline : Astuce (MongoDB) → AstuceResponseDto (DTO) → Tip (type UI via converter)
 */
export async function GET() {
  try {
    const result = await ContentService.getAstuces();
    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 });
    }
    // Conversion des DTOs Server Core en Tip pour le frontend
    const tips = astuceResponseDtosToTips(result.data ?? []);
    return NextResponse.json(tips);
  } catch (err) {
    console.error('[api/astuces]', err);
    return NextResponse.json({ error: 'Impossible de lire les astuces' }, { status: 500 });
  }
}
