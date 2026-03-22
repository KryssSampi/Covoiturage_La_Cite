"use client";

import React from "react";
import { FiX } from "react-icons/fi";

interface Chip {
  field: string;
  value: string;
  label: string;
}

interface ActiveChipsBarProps {
  chips: Chip[];
  onRemove: (field: string, value: string) => void;
  onClearAll: () => void;
}

export const ActiveChipsBar: React.FC<ActiveChipsBarProps> = ({
  chips,
  onRemove,
  onClearAll,
}) => {
  if (chips.length === 0) return null;

  return (
    <div className="flex gap-1.5 overflow-x-auto shrink-0 pb-0.5" style={{ scrollbarWidth: "none" }}>
      {chips.map((chip) => (
        <div
          key={`${chip.field}-${chip.value}`}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0"
          style={{ backgroundColor: "#e8eef7", color: "#08316e", fontSize: 11, fontWeight: 600 }}
        >
          {chip.label}
          <button
            type="button"
            onClick={() => onRemove(chip.field, chip.value)}
            className="flex items-center justify-center rounded-full hover:bg-blue-200 transition-colors"
            style={{ width: 14, height: 14 }}
          >
            <FiX size={9} />
          </button>
        </div>
      ))}

      {chips.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full shrink-0 transition-colors hover:bg-red-100"
          style={{ backgroundColor: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 600 }}
        >
          <FiX size={9} />
          Tout effacer
        </button>
      )}
    </div>
  );
};
