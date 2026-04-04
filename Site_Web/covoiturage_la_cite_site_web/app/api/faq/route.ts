/**
 * GET /api/faq
 * Retourne tous les items FAQ stockés en JSON.
 * Web-only — non exposé à l'app mobile.
 *
 * Le fichier source (faq-data.json) est la copie intégrale du chatbot.
 * Le converter élimine les champs chatbot-only (intent, entity, active,
 * variations, keywords, actions, conditions) et ne conserve que ce que
 * le front-end attend (id, sujet, categorie, items[{question, reponse}]).
 */
import { NextResponse } from 'next/server';
import { type NextRequest } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  convertChatbotFAQToWeb,
  type ChatbotFAQSection,
} from '@/features/faq/data/faq-converter';

const INTERNAL_TOKEN = process.env.CHATBOT_INTERNAL_TOKEN
  || '82a51cc52f5a012f6a153a529df06fe393e767f578bdd48af70d14e2126fd746';

export async function GET(request: NextRequest) {
  try {
    const filePath = join(process.cwd(), 'features', 'faq', 'data', 'faq-data.json');
    const raw      = readFileSync(filePath, 'utf-8');
    const sections: ChatbotFAQSection[] = JSON.parse(raw);

    // Si le chatbot appelle (token interne) → format complet avec tous les champs
    const token = request.headers.get('x-internal-token') ?? '';
    if (INTERNAL_TOKEN && token === INTERNAL_TOKEN) {
      return NextResponse.json(sections, { status: 200 });
    }

    // Sinon (front-end web) → format allégé
    const items = convertChatbotFAQToWeb(sections);
    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: 'Impossible de charger les FAQ.',
        detail: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 },
    );
  }
}
