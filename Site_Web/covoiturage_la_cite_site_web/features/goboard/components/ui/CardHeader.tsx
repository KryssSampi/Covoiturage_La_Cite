"use client";

/**
 * CardHeader — en-tête d'une Card Go! Board avec point coloré, titre ReactNode et slot droit.
 */

import React from "react";

// ─── Composant ──────────────────────────────────────────────────────────────

function CardHeader({ dotColor, title, right }: { dotColor: string; title: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(8,49,110,0.07)]">
      <div className="flex items-center gap-2 font-[Syne] font-bold text-sm text-[#0d1f3c]">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: dotColor }} />
        {title}
      </div>
      {right}
    </div>
  );
}

export default CardHeader;
