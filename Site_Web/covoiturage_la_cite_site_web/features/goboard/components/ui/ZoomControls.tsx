"use client";

/**
 * ZoomControls — boutons ＋ / － / ↺ pour zoomer sur un graphique Go! Board.
 */

import React from "react";

// ─── Composant ──────────────────────────────────────────────────────────────

function ZoomControls({ onPlus, onMinus, onReset }: { onPlus: () => void; onMinus: () => void; onReset: () => void }) {
  return (
    <div className="flex gap-1">
      {[{ label: "＋", fn: onPlus }, { label: "－", fn: onMinus }, { label: "↺", fn: onReset }].map((b) => (
        <button
          key={b.label}
          onClick={b.fn}
          className="flex items-center justify-center w-6.5 h-6.5 rounded-[7px] border-[1.5px] border-[rgba(8,49,110,0.18)] bg-white text-[#08316e] text-sm cursor-pointer font-bold font-['DM_Sans'] hover:bg-[#f0f4fb] transition-colors"
        >
          {b.label}
        </button>
      ))}
    </div>
  );
}

export default ZoomControls;
