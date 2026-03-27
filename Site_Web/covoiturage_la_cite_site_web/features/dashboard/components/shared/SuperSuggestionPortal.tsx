"use client";
// Portal pour les suggestions d'autocomplétion — dépasse le stacking context scale-110
import { useState, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import type { LocationSuggestion } from "../../types/search.types";

interface SuperSuggestionPortalProps {
  anchorRef:   { readonly current: HTMLElement | null };
  suggestions: LocationSuggestion[];
  onSelect:    (s: LocationSuggestion) => void;
}

/** Affiche la liste de suggestions en portal fixe, alignée sous l'ancre */
export function SuperSuggestionPortal({
  anchorRef,
  suggestions,
  onSelect,
}: SuperSuggestionPortalProps) {
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    if (!suggestions.length || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setCoords({ top: r.bottom + 4, left: r.left, width: Math.max(r.width, 220) });
  }, [suggestions, anchorRef]);

  if (!suggestions.length || !coords || typeof document === "undefined") return null;

  return createPortal(
    <ul style={{
      position:    "fixed",
      top:         coords.top,
      left:        coords.left,
      width:       coords.width,
      zIndex:      99999,
      background:  "#fff",
      borderRadius: 6,
      border:      "1px solid #d1d5db",
      boxShadow:   "0 10px 25px rgba(8,49,110,0.18)",
      overflow:    "hidden",
      padding:     0,
      margin:      0,
      listStyle:   "none",
    }}>
      {suggestions.map((s, i) => (
        <li
          key={i}
          className="p-3 hover:bg-blue-50 cursor-pointer text-sm border-b last:border-0 text-gray-800"
          onMouseDown={() => onSelect(s)}
        >
          {s.label}
        </li>
      ))}
    </ul>,
    document.body,
  );
}
