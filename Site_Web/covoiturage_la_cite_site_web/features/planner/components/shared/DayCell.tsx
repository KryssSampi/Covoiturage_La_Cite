"use client";

/**
 * @file DayCell.tsx
 * @description Cellule d'un jour dans la vue mensuelle du calendrier.
 *
 * États visuels gérés :
 *   - today + selected   : arrière-plan plein #08316e, chiffre blanc, halo lumineux
 *   - today (non sélectionné) : bordure pointillée #08316e, teinte bleue légère
 *   - selected (futur/présent, non today) : bordure solide #08316e, fond bleu très pâle
 *   - passé (mois courant)    : estompé, fond gris très léger
 *   - passé (hors mois)       : très estompé
 *   - hors mois (futur)       : fond transparent, chiffre très pâle
 *   - avec trajets (futur)    : couleur de saturation verte→rouge
 *   - vide + futur + courant  : bouton "+" discret
 *
 * Au clic : met à jour currentDay dans PlannerContext ET bascule la vue semaine.
 */

import { format, isBefore, isToday, startOfDay } from "date-fns";
import { FaPlus }                                  from "react-icons/fa6";
import { MonthCell}                         from "@/features/planner/types/calendar.types";
import { TODAY }                                   from "@/features/planner/constants/calendar.constants";
import {
  getRidesForDate,
  computeDaySaturation,
  getSaturationColor,
}                                                  from "@/features/planner/utils/calendar.utils";
import { useHeroSearchBar }                        from "@/features/planner/context/SearchBarContext";
import { usePlannerContext }                       from "@/features/planner/context/PlannerContext";
import { PublishedTrip, Reservation } from "@/features/dashboard/types";

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface DayCellProps {
  cell:        MonthCell;
  rides:       (PublishedTrip | Reservation)[];
  role:        string;
  /** Jour actuellement sélectionné dans le PlannerContext */
  selectedDay: Date;
  /** Callback : bascule la vue vers la semaine correspondante */
  onClick:     (date: Date) => void;
}

// ─── COMPOSANT ────────────────────────────────────────────────────────────────

/**
 * DayCell
 * Cellule mensuelle cliquable. Synchronise le jour sélectionné dans le contexte
 * partagé (PlannerContext) ET notifie le parent pour basculer en vue semaine.
 */
export function DayCell({ cell, rides, role: _role, selectedDay, onClick }: DayCellProps) { // eslint-disable-line @typescript-eslint/no-unused-vars

  // ── Calculs de date ──────────────────────────────────────────────────────
  const date       = new Date(cell.year, cell.month, cell.day);
  const past       = isBefore(startOfDay(date), startOfDay(TODAY)) && !isToday(date);
  const todayCell  = isToday(date);
  const isSelected = date.toDateString() === selectedDay.toDateString();
  const dayRides   = getRidesForDate(rides, date);
  const count      = dayRides.length;
  const ratio      = computeDaySaturation(rides, date);
  const satColor   = count > 0 && !past ? getSaturationColor(ratio) : null;

  // ── Contextes ────────────────────────────────────────────────────────────
  const { setDate, OpenSearchBar }   = useHeroSearchBar();
  const { setCurrentDay }            = usePlannerContext();

  // ── Gestionnaire de clic ─────────────────────────────────────────────────
  const handleClick = () => {
    // Synchronise le jour sélectionné dans le contexte partagé
    setCurrentDay(date);
    // Notifie le parent pour basculer vers la vue semaine
    onClick(date);
    // Pré-remplit la searchbar avec la date cliquée
    setDate(format(date, "yyyy-MM-dd"));
    OpenSearchBar();
  };

  // ── Calcul du fond de la cellule ─────────────────────────────────────────
  //
  // Priorité :
  //   1. today + selected → #08316e plein
  //   2. today seul       → teinte bleue + contour pointillé
  //   3. selected seul    → teinte bleue claire + contour solide
  //   4. past             → fond gris doux
  //   5. avec trajets     → couleur de saturation
  //   6. hors mois        → fond quasi-transparent
  //   7. défaut           → blanc pur

  let bgColor: string;
  let borderStyle: string;
  let opacity = 1;

  if (todayCell && isSelected) {
    // État "aujourd'hui ET sélectionné" : remplissage plein
    bgColor     = "#08316e";
    borderStyle = "2px solid #08316e";
  } else if (todayCell) {
    // État "aujourd'hui seul" : teinte bleue douce + contour pointillé
    bgColor     = "rgba(8,49,110,0.07)";
    borderStyle = "1.5px dashed rgba(8,49,110,0.55)";
  } else if (isSelected) {
    // État "sélectionné (non aujourd'hui)" : teinte bleue pâle + contour solide
    bgColor     = "rgba(8,49,110,0.09)";
    borderStyle = "1.5px solid rgba(8,49,110,0.7)";
  } else if (past) {
    // État "passé" : fond gris très léger
    bgColor     = cell.current ? "rgba(0,0,0,0.04)" : "rgba(0,0,0,0.02)";
    borderStyle = "0.5px solid rgba(0,0,0,0.08)";
    opacity     = cell.current ? 0.5 : 0.3;
  } else if (satColor) {
    // État "futur avec trajets" : dégradé de saturation
    bgColor     = satColor;
    borderStyle = "0.5px solid rgba(0,0,0,0.07)";
  } else if (!cell.current) {
    // Hors mois courant, futur
    bgColor     = "rgba(0,0,0,0.015)";
    borderStyle = "0.5px solid rgba(0,0,0,0.05)";
    opacity     = 0.55;
  } else {
    // Jour du mois courant, futur, vide
    bgColor     = "rgba(255,255,255,0.55)";
    borderStyle = "0.5px solid rgba(0,0,0,0.07)";
  }

  const base: React.CSSProperties = {
    borderRadius:   0,
    minHeight:      64,
    cursor:         "pointer",
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    justifyContent: "flex-start",
    padding:        "6px 4px 4px",
    margin:         0,
    border:         borderStyle,
    transition:     "background 0.18s, transform 0.12s, box-shadow 0.18s",
    position:       "relative",
    overflow:       "hidden",
    background:     bgColor,
    opacity,
    // Très léger lift interactif (non-passé uniquement)
    boxShadow:      isSelected
      ? "inset 0 0 0 999px rgba(8,49,110,0.03), 0 2px 8px rgba(8,49,110,0.12)"
      : "none",
  };

  // ── Couleur du numéro de jour ─────────────────────────────────────────────
  let dayNumColor: string;

  if (todayCell && isSelected) {
    dayNumColor = "#ffffff";                        // blanc sur fond plein
  } else if (todayCell) {
    dayNumColor = "#08316e";                        // bleu marine sur teinte
  } else if (isSelected) {
    dayNumColor = "#08316e";                        // bleu marine sur teinte
  } else if (past) {
    dayNumColor = cell.current
      ? "rgba(0,0,0,0.30)"                         // passé courant : gris moyen
      : "rgba(0,0,0,0.18)";                        // passé hors-mois : gris très clair
  } else if (!cell.current) {
    dayNumColor = "rgba(0,0,0,0.22)";              // hors mois : gris pâle
  } else if (count > 0) {
    dayNumColor = "rgba(0,0,0,0.45)";              // avec trajets : gris foncé discret
  } else {
    dayNumColor = "rgba(0,0,0,0.78)";              // vide futur : noir doux
  }

  // ── Poids de police du numéro ─────────────────────────────────────────────
  const dayNumWeight = (todayCell || isSelected) ? 800 : 500;

  // ── Couleur du badge "nb de trajets" ─────────────────────────────────────
  const badgeBg   = (todayCell && isSelected) ? "rgba(255,255,255,0.2)" : "#08316e";
  const badgeText = "#94a3b8";

  return (
    <div style={base} onClick={handleClick}>

      {/* Numéro du jour */}
      <span style={{
        fontSize:   13,
        fontWeight: dayNumWeight,
        color:      dayNumColor,
        lineHeight: 1,
      }}>
        {cell.day}
      </span>

      {/* Badge : nombre de trajets */}
      {count > 0 && (
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          marginTop:      10,
          background:     badgeBg,
          color:          badgeText,
          borderRadius:   50,
          fontSize:       15,
          fontWeight:     700,
          width:          26,
          height:         26,
        }}>
          {count}
        </div>
      )}

      {/* Bouton "+" : jours vides, futurs, dans le mois courant, non sélectionnés */}
      {count === 0 && !past && cell.current && !isSelected && (
        <div
          className="hover:scale-110"
          style={{
            marginTop:      6,
            width:          28,
            height:         28,
            borderRadius:   "50%",
            background:     "rgba(50,50,50,0.12)",
            border:         "1px solid rgba(0,0,0,0.08)",
            display:        "flex",
            alignItems:     "center",
            justifyContent: "center",
            color:          "rgba(0,0,0,0.35)",
            transition:     "all 0.2s",
          }}
        >
          <FaPlus size={10} />
        </div>
      )}

      {/* Marqueur "sélectionné" en bas de cellule (hors today) */}
      {isSelected && !todayCell && (
        <div style={{
          position:   "absolute",
          bottom:     0,
          left:       "50%",
          transform:  "translateX(-50%)",
          width:      24,
          height:     3,
          borderRadius: "3px 3px 0 0",
          background: "#08316e",
        }} />
      )}
    </div>
  );
}
