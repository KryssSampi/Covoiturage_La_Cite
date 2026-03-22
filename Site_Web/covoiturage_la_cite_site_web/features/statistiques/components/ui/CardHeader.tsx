"use client";

/**
 * CardHeader — en-tête d'une Card avec point coloré, titre et slot droit.
 */

import React from "react";

// ─── Composant ──────────────────────────────────────────────────────────────

const CardHeader: React.FC<{ title: string; dotColor?: string; right?: React.ReactNode }> = ({
  title, dotColor = "#08316e", right,
}) => (
  <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[rgba(8,49,110,0.09)]">
    <div className="flex items-center gap-1.5 font-['Syne',sans-serif] font-bold text-sm text-[#08316e]">
      <span className="inline-block w-2 h-2 rounded-full" style={{ background: dotColor }} />
      {title}
    </div>
    {right}
  </div>
);

export default CardHeader;
