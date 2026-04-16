/**
 * GET /api/faq
 * Retourne toutes les sections FAQ depuis le Server Core (MongoDB).
 * Web-only — non exposé à l'app mobile.
 *
 * Le Server Core est la source de vérité. Les données sont gérées
 * via l'interface admin (POST/PATCH/DELETE /api/faq).
 */
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { get } from '@/server/http-client';

const INTERNAL_TOKEN = process.env.CHATBOT_INTERNAL_TOKEN ?? '';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('x-internal-token') ?? '';
    if (INTERNAL_TOKEN && token === INTERNAL_TOKEN) {
      // Le chatbot peut aussi appeler directement le Server Core
    }

    const result = await get('api/faq');

    if (!result.success) {
      return NextResponse.json(
        { error: 'Impossible de charger les FAQ.', detail: result.message },
        { status: 502 },
      );
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sections = (result.data as any)?.data ?? (result.data as any) ?? [];

    // Format web allégé (compatible avec le frontend existant)
     
    const items = Array.isArray(sections)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? sections.map((s: any) => ({
          id: s.externalId ?? s.id,
          sujet: s.sujetFr ?? s.sujet,
          categorie: s.categorie,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items: (s.items ?? []).map((q: any) => ({
            question: q.questionFr ?? q.question,
            reponse: q.reponseFr ?? q.reponse,
          })),
        }))
      : [];

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[api/faq] GET error:', message);
    return NextResponse.json(
      {
        error: 'Impossible de charger les FAQ.',
        detail: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 },
    );
  }
}