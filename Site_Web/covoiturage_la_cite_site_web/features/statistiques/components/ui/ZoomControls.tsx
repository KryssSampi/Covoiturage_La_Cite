"use client";

/**
 * ZoomControls — boutons ＋ / － / ↺ pour zoomer sur un graphique.
 */

import React from "react";

// ─── Composant ──────────────────────────────────────────────────────────────

const ZoomControls: React.FC<{ onPlus: () => void; onMinus: () => void; onReset: () => void }> = ({
  onPlus, onMinus, onReset,
}) => (
  <div className="flex gap-1.5">
    {[
      { label: "＋", action: onPlus },
      { label: "－", action: onMinus },
      { label: "↺", action: onReset },
    ].map(({ label, action }) => (
      <button
        key={label}
        onClick={action}
        className="flex items-center justify-center w-[26px] h-[26px] rounded-[7px] border-[1.5px] border-[rgba(8,49,110,0.18)] bg-white text-[#08316e] text-sm cursor-pointer font-bold font-['DM_Sans',sans-serif] transition-colors hover:bg-[#f0f4fb]"
      >
        {label}
      </button>
    ))}
  </div>
);

export default ZoomControls;
