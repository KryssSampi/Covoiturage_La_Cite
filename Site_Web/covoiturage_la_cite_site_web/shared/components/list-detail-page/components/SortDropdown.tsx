"use client";

import React from "react";
import { FiCheck } from "react-icons/fi";
import { FaArrowsUpDown } from "react-icons/fa6";
import { SortOption } from "../types";

interface SortDropdownProps {
  sortOptions: SortOption[];
  activeSortValue: string;
  isOpen: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onSelect: (value: string) => void;
}

export const SortDropdown: React.FC<SortDropdownProps> = ({
  sortOptions,
  activeSortValue,
  isOpen,
  containerRef,
  onToggle,
  onSelect,
}) => (
  <div ref={containerRef} className="relative shrink-0">
    <button
      type="button"
      title="Trier"
      onClick={onToggle}
      className="flex items-center justify-center h-9 w-9 rounded-lg border transition-colors"
      style={{
        borderColor: isOpen ? "#08316e" : "#e5e7eb",
        backgroundColor: isOpen ? "#e8eef7" : "#ffffff",
        color: "#08316e",
      }}
    >
      <FaArrowsUpDown size={16} />
    </button>

    {isOpen && (
      <div
        className="absolute top-full right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-44"
        style={{ padding: "6px" }}
      >
        {sortOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onSelect(opt.value); onToggle(); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left"
            style={{
              backgroundColor: opt.value === activeSortValue ? "#e8eef7" : "transparent",
              color: opt.value === activeSortValue ? "#08316e" : "#374151",
            }}
          >
            {/* Icone de sélection au lieu d'un emoji */}
            {opt.value === activeSortValue && (
              <FiCheck size={10} style={{ color: "#08316e" }} />
            )}
            {opt.label}
          </button>
        ))}
      </div>
    )}
  </div>
);
