"use client";

import { FaChevronDown, FaChevronUp } from 'react-icons/fa6';
import type { FAQItemModel, FAQQuestion } from '../types/faq.types';

interface FAQCardProps {
  item:           FAQItemModel;
  isOpen:         boolean;
  activeQuestion: FAQQuestion | null;
  onToggle:       () => void;
  onSelect:       (question: FAQQuestion) => void;
}

export function FAQCard({ item, isOpen, activeQuestion, onToggle, onSelect }: FAQCardProps) {
  return (
    <div
      className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
        isOpen
          ? 'border-[#5E9FE9]/50 shadow-lg shadow-[#5E9FE9]/10'
          : 'border-gray-200 shadow-sm hover:border-[#5E9FE9]/30 hover:shadow-md'
      }`}
    >
      {/* En-tête de la carte — sujet */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 bg-white text-left group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors duration-200 ${isOpen ? 'bg-[#5E9FE9]' : 'bg-gray-300 group-hover:bg-[#5E9FE9]/60'}`} />
          <span className={`font-semibold text-sm lg:text-base transition-colors duration-200 ${isOpen ? 'text-[#08316E]' : 'text-gray-800'}`}>
            {item.sujet}
          </span>
        </div>
        <span className={`shrink-0 transition-colors duration-200 ${isOpen ? 'text-[#5E9FE9]' : 'text-gray-400'}`}>
          {isOpen ? <FaChevronUp className="text-sm" /> : <FaChevronDown className="text-sm" />}
        </span>
      </button>

      {/* Liste des questions — label boutons sans bordure */}
      {isOpen && (
        <ul className="bg-gray-50 border-t border-gray-100 py-1">
          {item.items.map((q, i) => (
            <li key={i}>
              <button
                onClick={() => onSelect(q)}
                className={`w-full text-left px-5 py-2.5 text-sm transition-colors duration-150 ${
                  activeQuestion?.question === q.question
                    ? 'text-[#08316E] font-semibold bg-[#5E9FE9]/10'
                    : 'text-gray-600 hover:text-[#08316E] hover:bg-white'
                }`}
              >
                {q.question}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
