"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        /* ── Backdrop ── */
        <motion.div
          className="fixed inset-0 z-50 flex items-end"
          initial={{ backgroundColor: "rgba(0,0,0,0)" }}
          animate={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          exit={{ backgroundColor: "rgba(0,0,0,0)" }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        >
          {/* ── Sheet ── */}
          <motion.div
            className="w-full bg-white rounded-t-2xl flex flex-col overflow-hidden relative"
            style={{ maxHeight: "85vh" }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Indicateur de drag */}
            <div className="flex items-center justify-center px-4 pt-3 pb-2 shrink-0">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Bouton fermer */}
            <motion.button
              type="button"
              onClick={onClose}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center"
              style={{ color: "#6b7280" }}
              whileHover={{ backgroundColor: "#e5e7eb", scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              transition={{ duration: 0.12 }}
            >
              <FiX size={14} />
            </motion.button>

            {/* Contenu scrollable */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
