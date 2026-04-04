/**
 * Converter : format chatbot faq_data.json → FAQItemModel[] (web)
 *
 * Le fichier faq-data.json est désormais la copie intégrale du chatbot.
 * Il contient des champs supplémentaires (intent, entity, active, variations,
 * keywords, actions, conditions) inutiles côté web.
 * Ce module les élimine et ne conserve que { id, sujet, categorie, items }.
 */

import type { FAQItemModel, FAQQuestion } from '@/domain/models/FAQItemModel';

/* ---------- Types source (chatbot) ---------- */

export interface ChatbotFAQItem {
  question:   string;
  reponse:    string;
  variations: string[];
  keywords:   string[];
  actions:    string[];
  conditions: string[];
}

export interface ChatbotFAQSection {
  id:        string;
  sujet:     string;
  categorie: string;
  intent:    string;
  entity:    string;
  active:    boolean;
  items:     ChatbotFAQItem[];
}

/* ---------- Converter ---------- */

export function convertChatbotFAQToWeb(
  sections: ChatbotFAQSection[],
): FAQItemModel[] {
  return sections
    .filter((s) => s.active)
    .map((section) => ({
      id:        section.id,
      sujet:     section.sujet,
      categorie: section.categorie,
      items:     section.items.map<FAQQuestion>((item) => ({
        question: item.question,
        reponse:  item.reponse,
      })),
    }));
}
