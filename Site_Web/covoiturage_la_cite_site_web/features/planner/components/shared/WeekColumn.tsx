"use client";

/**
 * @file WeekColumn.tsx
 * @description Colonne d'un jour dans la vue hebdomadaire.
 * Affiche les trajets positionnés en absolu selon leur heure de début/fin.
 * La colonne est estompée si le jour est passé.
 * Reçoit `selectedDay` depuis WeekGrid pour afficher un état "sélectionné".
 */

import { isBefore, isToday, startOfDay } from "date-fns";
import { TODAY }                           from "@/features/planner/constants/calendar.constants";
import {
  getRidesForDate,
  computeDaySaturation,
  getSaturationColor,
}                                          from "@/features/planner/utils/calendar.utils";
import { RideCell }                        from "@/features/planner/components/shared/RideCell";
import { PublishedTrip, Reservation } from "@/features/dashboard/types";

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface WeekColumnProps {
  /** Jour représenté par cette colonne */
  day:         Date;
  rides:       (PublishedTrip | Reservation)[];
  role:        string;
  /** Jour sélectionné dans PlannerContext — si identique à day, colonne mise en valeur */
  selectedDay: Date;
}

// ─── COMPOSANT ────────────────────────────────────────────────────────────────

/**
 * WeekColumn
 * Colonne d'un jour dans la vue hebdomadaire.
 * États gérés :
 *   - passé       : opacity 0.42
 *   - selected    : bandeau gauche #08316e + fond bleu très pâle
 *   - today       : fond légèrement teinté
 *   - avec trajets : saturation couleur
 */
export function WeekColumn({ day, rides, role, selectedDay }: WeekColumnProps) {
  const past       = isBefore(startOfDay(day), startOfDay(TODAY)) && !isToday(day);
  const todayCol   = isToday(day);
  const isSelected = day.toDateString() === selectedDay.toDateString();
  const dayRides   = getRidesForDate(rides, day);
  const ratio      = computeDaySaturation(rides, day);

  // Fond de saturation (uniquement si trajets présents et non passé)
  const satColor = dayRides.length > 0 && !past ? getSaturationColor(ratio) : null;

  // Fond de la colonne selon l'état
  let bg: string;
  if (isSelected && todayCol) {
    bg = "rgba(8,49,110,0.07)";   // selected + today
  } else if (isSelected) {
    bg = "rgba(8,49,110,0.05)";   // sélectionné non-today
  } else if (satColor) {
    bg = satColor;
  } else if (todayCol) {
    bg = "rgba(8,49,110,0.03)";   // aujourd'hui, pas de trajet
  } else {
    bg = "transparent";
  }

  return (
    <div
      className="weekcolumn"
      style={{
        flex:        1,
        position:    "relative",
        background:  bg,
        // Bandeau gauche colorié pour signaler la colonne sélectionnée
        borderLeft:  isSelected
          ? "2px solid rgba(8,49,110,0.55)"
          : "1px solid rgba(0,0,0,0.04)",
        borderRight: "1px solid rgba(0,0,0,0.04)",
        opacity:     past ? 0.42 : 1,
        minWidth:    0,
        height:      "100%",
        transition:  "background 0.18s, border 0.18s",
      }}
    >
      {/* Blocs de trajets positionnés en absolu */}
      {dayRides.map((ride) => (
        <RideCell key={ride.id} ride={ride} role={role} colWidth={100} />
      ))}
    </div>
  );
}
