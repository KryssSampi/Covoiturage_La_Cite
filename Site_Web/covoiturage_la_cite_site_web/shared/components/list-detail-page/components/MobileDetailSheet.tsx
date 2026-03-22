"use client";

import React, { useEffect } from "react";
import { FiX } from "react-icons/fi";

interface MobileDetailSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const MobileDetailSheet: React.FC<MobileDetailSheetProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  // Fermer la sheet avec la touche Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="w-full bg-white rounded-t-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Indicateur de drag */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 shrink-0">
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
        </div>

        {/* Bouton fermer */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          style={{ color: "#6b7280" }}
        >
          <FiX size={14} />
        </button>

        {/* Contenu scrollable */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {children}
        </div>
      </div>
    </div>
  );
};
