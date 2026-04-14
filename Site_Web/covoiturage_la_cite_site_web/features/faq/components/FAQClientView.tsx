"use client";

import Link from 'next/link';
import { FaEnvelope, FaCircleInfo } from 'react-icons/fa6';

import { useFAQ }            from '../hooks/useFAQ';
import { FAQCard }           from './FAQCard';
import { FAQAnswerPanel }    from './FAQAnswerPanel';
import { FAQCategoryTabs }   from './FAQCategoryTabs';
import { FAQSearch }         from './FAQSearch';
import type { FAQItemModel } from '../types/faq.types';

interface FAQClientViewProps {
  items: FAQItemModel[];
}

export function FAQClientView({ items }: FAQClientViewProps) {
  const {
    filters,
    filteredItems,
    activeItemId,
    activeQuestion,
    activeItem,
    selectQuestion,
    toggleCard,
    setSearch,
    setCategorie,
  } = useFAQ(items);

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Barre de recherche + filtres ─────────────────────────────────── */}
      <section className="sticky top-14 lg:top-16 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <FAQSearch value={filters.search} onChange={setSearch} />
          <FAQCategoryTabs active={filters.categorie} onChange={setCategorie} />
        </div>
      </section>

      {/* ── Corps principal — deux colonnes ──────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:py-12">

        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FaCircleInfo className="text-5xl text-gray-300 mb-4" />
            <h3 className="text-lg font-semibold text-gray-500 mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-400 text-sm max-w-sm">
              Essayez d&apos;autres mots-clés ou sélectionnez une autre catégorie.
            </p>
            <button
              onClick={() => { setSearch(''); setCategorie(''); }}
              className="mt-4 text-sm text-[#5E9FE9] hover:underline"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6 lg:gap-10 items-start">

            {/* ── Colonne gauche — cartes sujets ──────────────────────── */}
            <aside className="space-y-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
                Questions fréquentes
              </h2>
              {filteredItems.map((item) => (
                <FAQCard
                  key={item.id}
                  item={item}
                  isOpen={activeItemId === item.id}
                  activeQuestion={activeItemId === item.id ? activeQuestion : null}
                  onToggle={() => toggleCard(item.id)}
                  onSelect={(q) => selectQuestion(item, q)}
                />
              ))}
            </aside>

            {/* ── Colonne droite — panneau réponse ────────────────────── */}
            <div className="lg:sticky lg:top-32 min-h-[50vh] lg:min-h-[calc(100vh-10rem)]">
              <FAQAnswerPanel activeItem={activeItem} activeQuestion={activeQuestion} />
            </div>
          </div>
        )}

        {/* ── Bannière contact ─────────────────────────────────────────── */}
        <div className="mt-16 rounded-2xl bg-gradient-to-br from-[#08316E] to-[#0d3f7e] text-white p-8 text-center shadow-xl">
          <h3 className="text-xl font-bold mb-2">
            Vous n&apos;avez pas trouvé votre réponse ?
          </h3>
          <p className="text-blue-200 text-sm mb-6 max-w-md mx-auto">
            Notre équipe est disponible pour vous aider. Contactez-nous directement et nous vous répondrons dans les 24-48 heures.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5E9FE9] px-6 py-3 text-sm font-semibold text-white hover:bg-[#4a8fd4] transition-colors shadow-lg shadow-[#5E9FE9]/30"
            >
              <FaEnvelope className="text-sm" />
              Nous contacter
            </Link>
            <a
              href="mailto:support@lacitec.on.ca"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-400/40 px-6 py-3 text-sm font-semibold text-blue-100 hover:bg-white/10 transition-colors"
            >
              support@lacitec.on.ca
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
