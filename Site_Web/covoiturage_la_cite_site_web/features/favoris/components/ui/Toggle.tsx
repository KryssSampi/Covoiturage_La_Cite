"use client";

/**
 * Interrupteur à bascule (on/off) utilisé dans AlerteCard.
 */

import React from "react";

// ─── Props ───────────────────────────────────────────────────────────────────

interface ToggleProps {
  on: boolean;
  onChange: (v: boolean) => void;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const Toggle: React.FC<ToggleProps> = ({ on, onChange }) => (
  <button
    type="button"
    aria-pressed={on}
    onClick={() => onChange(!on)}
    className={`relative w-[34px] h-[19px] rounded-[10px] border-[1.5px] cursor-pointer transition-colors duration-300 shrink-0 ${
      on ? "bg-[#0aad6a] border-[#0aad6a]" : "bg-[rgba(8,49,110,0.12)] border-[rgba(8,49,110,0.18)]"
    }`}
  >
    <span
      className="absolute top-[1px] w-[13px] h-[13px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-[left] duration-300"
      style={{ left: on ? 15 : 1 }}
    />
  </button>
);

export default Toggle;
