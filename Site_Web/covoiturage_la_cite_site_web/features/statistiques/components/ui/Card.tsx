"use client";

/**
 * Card — conteneur blanc arrondi avec animation scroll-reveal.
 */

import React from "react";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";

// ─── Composant ──────────────────────────────────────────────────────────────

const Card: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children, className, delay = 0,
}) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  return (
    <div
      ref={ref}
      className={`scroll-reveal${isVisible ? " visible" : ""} bg-white border border-[rgba(8,49,110,0.09)] rounded-2xl shadow-[0_2px_18px_rgba(8,49,110,0.09)] overflow-hidden ${className ?? ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default Card;
