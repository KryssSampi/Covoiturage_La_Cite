"use client";

import { FAQ_CATEGORIES } from '../types/faq.types';

interface FAQCategoryTabsProps {
  active:   string;
  onChange: (cat: string) => void;
}

export function FAQCategoryTabs({ active, onChange }: FAQCategoryTabsProps) {
  const tabs = [{ label: 'Tous', value: '' }, ...FAQ_CATEGORIES.map((c) => ({ label: c, value: c }))];

  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
            active === tab.value
              ? 'bg-[#08316E] text-white shadow-md shadow-[#08316E]/20'
              : 'bg-white border border-gray-200 text-gray-600 hover:border-[#5E9FE9]/50 hover:text-[#08316E]'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
