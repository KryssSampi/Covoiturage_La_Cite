"use client";

import { DAYS_FR, DAYS_EN } from "@/features/planner/constants/calendar.constants";
import { buildMonthCells } from "@/features/planner/utils/calendar.utils";
import { DayCell } from "@/features/planner/components/shared/DayCell";
import { PublishedTrip, Reservation } from "@/features/dashboard/types";

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface MonthGridProps {
  /** Activer les libellés en français */
  isFr:        boolean;
  /** Date de référence : le mois affiché est celui du pivot */
  pivot:       Date;
  rides:       (PublishedTrip | Reservation)[];
  role:        string;
  /** Jour actuellement sélectionné — transmis à chaque DayCell */
  selectedDay: Date;
  /** Callback déclenché lorsque l'utilisateur clique sur un jour */
  onDayClick:  (date: Date) => void;
}

// ─── COMPOSANT ────────────────────────────────────────────────────────────────

/**
 * Grille mensuelle du calendrier (7 colonnes × N lignes).
 * Affiche les en-têtes des jours de la semaine, puis les cellules de chaque jour.
 */
export function MonthGrid({ isFr, pivot, rides, role, selectedDay, onDayClick }: MonthGridProps) {
  const cells = buildMonthCells(pivot);
  const days  = isFr ? DAYS_FR : DAYS_EN;

  return (
    <div style={{
      minHeight:           "50vh",
      display:             "grid",
      gridTemplateColumns: "repeat(7,1fr)",
      gridAutoRows:        "1fr",
      gap:                 0,
      padding:             "0",
      background:          "#ffffff",
    }}>
      {/* En-têtes des jours de la semaine */}
      {days.map((d) => (
        <div key={d} style={{
          textAlign:       "center",
          fontSize:        20,
          fontWeight:      600,
          color:           "#08316e",
          padding:         "5px 0",
          borderInline:    "1px solid #d1d5db",
          borderBlock:     "1px solid #d1d5db",
          letterSpacing:   1,
          textTransform:   "uppercase",
          background:      "#f8fafc",
        }}>
          {d}
        </div>
      ))}

      {/* Cellules des jours */}
      {cells.map((cell, i) => (
        <DayCell
          key={i}
          cell={cell}
          rides={rides}
          role={role}
          selectedDay={selectedDay}
          onClick={onDayClick}
        />
      ))}
    </div>
  );
}
