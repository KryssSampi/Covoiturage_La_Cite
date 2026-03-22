"use client";

/**
 * Card — conteneur blanc arrondi avec animation fadeUp pour la page Go! Board.
 */

import React from "react";

// ─── Composant ──────────────────────────────────────────────────────────────

function Card({ delay = 0, className = "", children }: { delay?: number; className?: string; children: React.ReactNode }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-[rgba(8,49,110,0.09)] shadow-[0_2px_12px_rgba(8,49,110,0.06)] overflow-hidden ${className}`}
      style={{ animation: `fadeUp 0.45s ease ${delay}ms both` }}
    >
      {children}
    </div>
  );
}

export default Card;
