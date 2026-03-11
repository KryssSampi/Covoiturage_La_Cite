"use client";

import { addMonths, addWeeks, startOfWeek, endOfWeek, format } from "date-fns";
import { fr, enUS as en } from "date-fns/locale";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa6";
import {
  TODAY, MONTHS_FR, MONTHS_EN, MIN_YEAR, MAX_YEAR,
  navBtnStyle, selectStyle,
} from "@/features/planner/constants/calendar.constants";

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface CalendarNavProps {
  /** Activer les libellés en français */
  isFr:          boolean;
  /** Vue active ("month" ou "week") */
  view:          string;
  /** Décalage courant en mois */
  monthOffset:   number;
  /** Décalage courant en semaines */
  weekOffset:    number;
  /** Navigue d'un pas dans la direction donnée ("next" ou "prev") */
  onNavigate:    (dir: string) => void;
  /** Téléporte directement à un offset de mois spécifique */
  onMonthJump:   (offset: number) => void;
  /** Téléporte directement à un offset de semaine spécifique */
  onWeekJump:    (offset: number) => void;
}

// ─── COMPOSANT ────────────────────────────────────────────────────────────────

/**
 * Barre de navigation du calendrier.
 * En vue mensuelle : affiche des sélecteurs mois/année.
 * En vue hebdomadaire : affiche l'intervalle de dates de la semaine.
 */
export function CalendarNav({
  isFr,
  view,
  monthOffset,
  weekOffset,
  onNavigate,
  onMonthJump,
}: CalendarNavProps) {
  const monthPivot = addMonths(TODAY, monthOffset);
  const weekPivot  = addWeeks(TODAY, weekOffset);
  const MONTHS     = isFr ? MONTHS_FR : MONTHS_EN;
  const weekStart  = startOfWeek(weekPivot, { weekStartsOn: 0 });
  const weekEnd    = endOfWeek(weekPivot,   { weekStartsOn: 0 });

  // Options d'années pour le sélecteur
  const yearOptions: number[] = [];
  for (let y = MIN_YEAR; y <= MAX_YEAR; y++) yearOptions.push(y);

  return (
    <div style={{
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      padding:        "10px 16px",
      flexShrink:     0,
    }}>
      {/* Bouton précédent */}
      <button onClick={() => onNavigate("prev")} style={navBtnStyle}>
        <FaChevronLeft size={18} />
      </button>

      {/* Contrôles centraux selon la vue */}
      {view === "month" ? (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {/* Sélecteur de mois */}
          <select
            value={monthPivot.getMonth()}
            onChange={(e) => {
              const m    = parseInt(e.target.value);
              const diff = (monthPivot.getFullYear() - TODAY.getFullYear()) * 12 + m - TODAY.getMonth();
              onMonthJump(diff);
            }}
            style={selectStyle}
          >
            {MONTHS.map((mn, i) => <option key={i} value={i}>{mn}</option>)}
          </select>

          {/* Sélecteur d'année */}
          <select
            value={monthPivot.getFullYear()}
            onChange={(e) => {
              const y    = parseInt(e.target.value);
              const diff = (y - TODAY.getFullYear()) * 12 + monthPivot.getMonth() - TODAY.getMonth();
              onMonthJump(diff);
            }}
            style={selectStyle}
          >
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      ) : (
        /* Intervalle de la semaine pour la vue hebdomadaire */
        <div style={{ fontSize: 19, fontWeight: 600, color: "rgb(0,0,0)", letterSpacing: 0.3 }}>
          {format(weekStart, "d MMM", { locale: isFr ? fr : en })}
          <span style={{ color: "rgba(0,0,0,0.7)", margin: "0 6px" }}>—</span>
          {format(weekEnd, "d MMM yyyy", { locale: isFr ? fr : en })}
        </div>
      )}

      {/* Bouton suivant */}
      <button onClick={() => onNavigate("next")} style={navBtnStyle}>
        <FaChevronRight size={18} />
      </button>
    </div>
  );
}
