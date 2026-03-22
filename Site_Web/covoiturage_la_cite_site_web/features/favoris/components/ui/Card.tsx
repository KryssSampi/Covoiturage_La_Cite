"use client";

/**
 * Carte blanche avec animation scroll-reveal pour la page Favoris.
 * Pas de prop delay (les enfants gèrent leur propre délai).
 */

import React from "react";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";

// ─── Props ───────────────────────────────────────────────────────────────────

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const Card: React.FC<CardProps> = ({ children, className }) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`scroll-reveal${isVisible ? " visible" : ""} bg-white border border-[rgba(8,49,110,0.09)] rounded-2xl shadow-[0_2px_18px_rgba(8,49,110,0.09)] overflow-hidden ${className ?? ""}`}
    >
      {children}
    </div>
  );
};

export default Card;
