"use client";

import { FaCircleQuestion } from 'react-icons/fa6';
import type { FAQItemModel, FAQQuestion } from '../types/faq.types';

interface FAQAnswerPanelProps {
  activeItem:     FAQItemModel | null;
  activeQuestion: FAQQuestion | null;
}

export function FAQAnswerPanel({ activeItem, activeQuestion }: FAQAnswerPanelProps) {
  if (!activeItem || !activeQuestion) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-64 text-center px-8 py-12 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
        <FaCircleQuestion className="text-5xl text-[#5E9FE9]/40 mb-4" />
        <p className="text-gray-400 text-sm leading-6 max-w-xs">
          Sélectionnez une question dans la liste pour afficher la réponse ici.
        </p>
      </div>
    );
  }

  const otherQuestions = activeItem.items.filter(
    (q) => q.question !== activeQuestion.question,
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Titre — sujet */}
      <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-[#08316E]/5 to-transparent">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5E9FE9] mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#5E9FE9]" />
          {activeItem.sujet}
        </span>
      </div>

      <div className="px-6 py-6 space-y-6">
        {/* Question active */}
        <div>
          <h3 className="font-bold text-[#08316E] text-base lg:text-lg leading-snug mb-3">
            {activeQuestion.question}
          </h3>
          <p className="text-gray-600 leading-7 text-sm lg:text-base">
            {activeQuestion.reponse}
          </p>
        </div>

        {/* Autres questions du même sujet */}
        {otherQuestions.length > 0 && (
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              Autres questions dans ce sujet
            </p>
            <div className="space-y-5">
              {otherQuestions.map((q, i) => (
                <div key={i}>
                  <h4 className="font-semibold text-gray-800 text-sm mb-1.5">{q.question}</h4>
                  <p className="text-gray-500 text-sm leading-6">{q.reponse}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
