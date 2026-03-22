"use client";

import React from "react";
import { FiSearch, FiInbox } from "react-icons/fi";
import { EmptyAction } from "../types";

interface EmptyStateProps {
  /** "no-data" = liste vraiment vide | "no-results" = filtres/recherche sans correspondance */
  type: "no-data" | "no-results";
  message?: string;
  emptyAction?: EmptyAction;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  message,
  emptyAction,
  onClearFilters,
}) => {
  const isNoData = type === "no-data";

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white/60 rounded-lg px-6 py-10 text-center gap-3">
      {/* Icone */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{ backgroundColor: "#e8eef7" }}
      >
        {isNoData
          ? <FiInbox size={26} style={{ color: "#08316e", opacity: 0.6 }} />
          : <FiSearch size={26} style={{ color: "#08316e", opacity: 0.6 }} />
        }
      </div>

      {/* Titre */}
      <p className="text-lg font-bold text-gray-700">
        {isNoData ? "Aucun element" : "Aucun resultat"}
      </p>

      {/* Message personnalisable */}
      <p className="text-md text-gray-400 leading-relaxed max-w-48">
        {message ?? (
          isNoData
            ? "Aucun element a afficher pour le moment."
            : "Aucun element ne correspond a votre recherche ou vos filtres."
        )}
      </p>

      {/* CTA pour liste vide */}
      {isNoData && emptyAction && (
        <button
          type="button"
          onClick={emptyAction.onClick}
          className="mt-1 px-5 py-2.5 rounded-xl text-white text-xs font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#08316e" }}
        >
          {emptyAction.label}
        </button>
      )}

      {/* Bouton reinitialiser les filtres */}
      {!isNoData && onClearFilters && (
        <button
          type="button"
          onClick={onClearFilters}
          className="mt-1 px-5 py-2.5 rounded-xl text-white text-xs font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: "#6b7280" }}
        >
          Reinitialiser les filtres
        </button>
      )}
    </div>
  );
};
