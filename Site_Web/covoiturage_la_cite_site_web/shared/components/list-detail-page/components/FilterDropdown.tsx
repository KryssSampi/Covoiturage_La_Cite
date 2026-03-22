"use client";

import React from "react";
import { FiSliders } from "react-icons/fi";
import { FilterGroup } from "../types";

interface FilterDropdownProps {
  filterGroups: FilterGroup[];
  activeFilters: Record<string, Set<string>>;
  activeCount: number;
  isOpen: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  onToggle: () => void;
  onToggleFilter: (field: string, value: string) => void;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  filterGroups,
  activeFilters,
  activeCount,
  isOpen,
  containerRef,
  onToggle,
  onToggleFilter,
}) => (
  <div ref={containerRef} className="relative shrink-0">
    <button
      type="button"
      title="Filtrer"
      onClick={onToggle}
      className="relative flex items-center justify-center h-9 w-9 rounded-lg border transition-colors"
      style={{
        borderColor: isOpen || activeCount > 0 ? "#08316e" : "#e5e7eb",
        backgroundColor: isOpen || activeCount > 0 ? "#e8eef7" : "#ffffff",
        color: "#08316e",
      }}
    >
      <FiSliders size={16} />
      {activeCount > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white flex items-center justify-center"
          style={{ fontSize: 9, fontWeight: 700, backgroundColor: "#08316e" }}
        >
          {activeCount}
        </span>
      )}
    </button>

    {isOpen && (
      <div
        className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-50 min-w-48"
        style={{ padding: "10px" }}
      >
        {filterGroups.map((group) => (
          <div key={group.field}>
            <p
              className="uppercase tracking-wider mb-1.5 px-1"
              style={{ fontSize: 10, fontWeight: 700, color: "#6b7280" }}
            >
              {group.title}
            </p>
            {group.options.map((opt) => {
              const checked = activeFilters[group.field]?.has(opt.value) ?? false;
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-2 px-1 py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 text-xs"
                  style={{ color: "#374151" }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleFilter(group.field, opt.value)}
                    className="w-3.5 h-3.5 rounded"
                    style={{ accentColor: "#08316e" }}
                  />
                  {opt.label}
                </label>
              );
            })}
            <div className="border-t border-gray-100 my-1.5" />
          </div>
        ))}
      </div>
    )}
  </div>
);
