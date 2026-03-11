"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { format } from "date-fns";
import { FaPlus, FaBan } from "react-icons/fa6";
import { useHeroSearchBar } from "@/features/planner/context/SearchBarContext";
import { useIndisponibility } from "@/features/planner/context/IndisponibilityContext";

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface TimeCellProps {
  /** Jour auquel appartient ce créneau */
  day:     Date;
  /** Heure du créneau (borne inférieure) */
  hour:    number;
  /** Minute du créneau (borne inférieure) */
  minute:  number;
  /** Vrai si ce créneau contient déjà un trajet (RideCell) */
  hasRide: boolean;
}

// ─── COMPOSANT ────────────────────────────────────────────────────────────────

/**
 * Cellule interactive à l'intersection d'une colonne-jour et d'un créneau horaire.
 *
 * - Clic gauche / droit : ouvre un menu contextuel.
 * - Si le mode disponibilité est actif ET que la cellule n'a pas de trajet,
 *   une case à cocher apparaît dans le coin supérieur gauche pour marquer
 *   le créneau comme indisponible dans la liste partagée.
 */
export function TimeCell({ day, hour, minute, hasRide }: TimeCellProps) {
  // ── État local : position du menu contextuel (null = fermé) ──────────────
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // ── Contextes ─────────────────────────────────────────────────────────────
  const { enterPlannerMode, setDate, setTime } = useHeroSearchBar();
  const {
    disponibilitySetterIsActive,
    isSlotUnavailable,
    toggleSlotUnavailability,
    markSlotUnavailable,
  } = useIndisponibility();

  // Indique si ce créneau est actuellement marqué indisponible
  const unavailable = isSlotUnavailable(day, hour, minute);

  // ── Fermeture du menu contextuel au clic extérieur ────────────────────────
  useEffect(() => {
    if (!menuPos) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuPos(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuPos]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  /** Ouvre le menu contextuel */
  const handleOpen = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setMenuPos({ x: e.clientX, y: e.clientY });
  };

  /** Pré-remplit la searchbar avec la date/heure et bascule immédiatement en mode planner search */
  const handleAddRide = () => {
    setMenuPos(null);
    setDate(format(day, "yyyy-MM-dd"));
    setTime(`${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`);
    // Déclenche l'animation calendrier → RouteMapSearch ET ouvre la searchbar
    enterPlannerMode();
  };

  /** Marque le créneau comme indisponible depuis le menu contextuel */
  const handleMarkUnavailable = () => {
    setMenuPos(null);
    markSlotUnavailable(day, hour, minute);
  };

  /** Bascule la case à cocher d'indisponibilité */
  const handleCheckboxToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSlotUnavailability(day, hour, minute);
  };

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/*
       * Cellule interactive de la grille.
       * Fond rouge translucide si le créneau est marqué indisponible.
       */}
      <div
        onClick={handleOpen}
        onContextMenu={handleOpen}
        style={{
          flex:       1,
          cursor:     "pointer",
          position:   "relative",
          background: unavailable
            ? "rgba(220,38,38,0.14)"
            : "transparent",
          transition: "background 0.15s",
        }}
        onMouseEnter={(e) => {
          if (!unavailable)
            e.currentTarget.style.background = "rgba(8,49,110,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = unavailable
            ? "rgba(220,38,38,0.14)"
            : "transparent";
        }}
      >
        {/*
         * Case à cocher d'indisponibilité.
         * Visible uniquement si le panneau d'indisponibilité est actif
         * ET que le créneau ne contient pas de trajet.
         */}
        {disponibilitySetterIsActive && !hasRide && (
          <button
            onClick={handleCheckboxToggle}
            title={
              unavailable
                ? "Retirer l'indisponibilité"
                : "Marquer comme indisponible"
            }
            style={{
              position:       "absolute",
              top:            2,
              left:           2,
              width:          14,
              height:         14,
              borderRadius:   3,
              border:         unavailable
                ? "2px solid #dc2626"
                : "2px solid rgba(8,49,110,0.35)",
              background:     unavailable ? "#dc2626" : "rgba(255,255,255,0.7)",
              cursor:         "pointer",
              zIndex:         3,
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              transition:     "all 0.15s",
              padding:        0,
            }}
          >
            {unavailable && (
              <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                <path
                  d="M1.5 5L4 7.5L8.5 2.5"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {/* Menu contextuel rendu via portal */}
      {menuPos && createPortal(
        <div
          ref={menuRef}
          style={{
            position:     "fixed",
            top:          menuPos.y,
            left:         menuPos.x,
            zIndex:       9999,
            background:   "#fff",
            border:       "1px solid rgba(8,49,110,0.18)",
            borderRadius: 10,
            boxShadow:    "0 8px 32px rgba(8,49,110,0.18), 0 2px 8px rgba(0,0,0,0.10)",
            minWidth:     200,
            overflow:     "hidden",
            padding:      "4px 0",
            fontFamily:   "'Segoe UI', system-ui, sans-serif",
          }}
        >
          {/* En-tête : date et heure du créneau */}
          <div style={{
            padding:       "7px 14px 6px",
            fontSize:      11,
            fontWeight:    700,
            color:         "#94a3b8",
            letterSpacing: 0.8,
            textTransform: "uppercase",
            borderBottom:  "1px solid rgba(0,0,0,0.07)",
          }}>
            {format(day, "EEE d MMM")} · {String(hour).padStart(2, "0")}:{String(minute).padStart(2, "0")}
          </div>

          {/* Option : Ajouter un trajet */}
          <button
            onClick={handleAddRide}
            style={{
              width:       "100%",
              background:  "transparent",
              border:      "none",
              cursor:      "pointer",
              display:     "flex",
              alignItems:  "center",
              gap:         9,
              padding:     "9px 14px",
              fontSize:    14,
              fontWeight:  600,
              color:       "#08316e",
              textAlign:   "left",
              transition:  "background 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(8,49,110,0.08)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <FaPlus size={13} color="#08316e" />
            Ajouter un trajet
          </button>

          {/* Option : Marquer indisponible (visible si pas de trajet) */}
          {!hasRide && (
            <button
              onClick={handleMarkUnavailable}
              style={{
                width:       "100%",
                background:  "transparent",
                border:      "none",
                cursor:      "pointer",
                display:     "flex",
                alignItems:  "center",
                gap:         9,
                padding:     "9px 14px",
                fontSize:    14,
                fontWeight:  600,
                color:       unavailable ? "#6b7280" : "#dc2626",
                textAlign:   "left",
                transition:  "background 0.15s",
                opacity:     unavailable ? 0.55 : 1,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(220,38,38,0.07)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              disabled={unavailable}
              title={unavailable ? "Ce créneau est déjà marqué indisponible" : ""}
            >
              <FaBan size={13} color={unavailable ? "#9ca3af" : "#dc2626"} />
              {unavailable ? "Déjà indisponible" : "Marquer indisponible"}
            </button>
          )}
        </div>,
        document.body
      )}
    </>
  );
}
