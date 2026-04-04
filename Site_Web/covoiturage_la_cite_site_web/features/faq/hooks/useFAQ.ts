"use client";

import { useState, useMemo } from 'react';
import type { FAQItemModel, FAQQuestion, FAQFilters } from '../types/faq.types';

export function useFAQ(items: FAQItemModel[]) {
  const [filters, setFilters]   = useState<FAQFilters>({ search: '', categorie: '' });
  const [activeItemId, setActiveItemId]   = useState<string | null>(null);
  const [activeQuestion, setActiveQuestion] = useState<FAQQuestion | null>(null);

  const filteredItems = useMemo(() => {
    let list = items;

    if (filters.categorie) {
      list = list.filter((i) => i.categorie === filters.categorie);
    }

    if (filters.search.trim()) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (i) =>
          i.sujet.toLowerCase().includes(q) ||
          i.items.some(
            (fq) =>
              fq.question.toLowerCase().includes(q) ||
              fq.reponse.toLowerCase().includes(q),
          ),
      );
    }

    return list;
  }, [items, filters]);

  const selectQuestion = (item: FAQItemModel, question: FAQQuestion) => {
    setActiveItemId(item.id);
    setActiveQuestion(question);
  };

  const toggleCard = (id: string) => {
    setActiveItemId((prev) => (prev === id ? null : id));
    setActiveQuestion(null);
  };

  const setSearch    = (search: string)    => setFilters((f) => ({ ...f, search }));
  const setCategorie = (categorie: string) => {
    setFilters((f) => ({ ...f, categorie }));
    setActiveItemId(null);
    setActiveQuestion(null);
  };

  const activeItem = items.find((i) => i.id === activeItemId) ?? null;

  return {
    filters,
    filteredItems,
    activeItemId,
    activeQuestion,
    activeItem,
    selectQuestion,
    toggleCard,
    setSearch,
    setCategorie,
  };
}
