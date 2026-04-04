"use client";

import { FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';

interface FAQSearchProps {
  value:    string;
  onChange: (value: string) => void;
}

export function FAQSearch({ value, onChange }: FAQSearchProps) {
  return (
    <div className="relative max-w-xl w-full">
      <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Rechercher une question, un sujet…"
        className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#5E9FE9] focus:ring-2 focus:ring-[#5E9FE9]/20 transition-all duration-200 shadow-sm"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Effacer la recherche"
        >
          <FaXmark className="text-sm" />
        </button>
      )}
    </div>
  );
}
