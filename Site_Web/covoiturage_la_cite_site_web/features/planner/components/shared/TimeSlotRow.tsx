"use client";

import { PX_PER_MIN } from "@/features/planner/constants/calendar.constants";
import { hasRideInSlot } from "@/features/planner/utils/calendar.utils";
import { TimeCell } from "@/features/planner/components/shared/TimeCell";
import { PublishedTrip, Reservation } from "@/features/dashboard/types";

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface TimeSlotRowProps {
  /** Heure du créneau (borne inférieure) */
  hour:   number;
  /** Minute du créneau (borne inférieure) */
  minute: number;
  /** Jours affichés dans la vue (une cellule par jour) */
  days:   Date[];
  rides:  (PublishedTrip | Reservation)[];
  role:   string;
}

// ─── COMPOSANT ────────────────────────────────────────────────────────────────

/**
 * Ligne d'un créneau horaire dans la vue hebdomadaire.
 * Affiche le label horaire sur la gauche et une cellule cliquable pour chaque jour.
 * La bordure du haut est pleine pour les heures entières, pointillée pour les demi-heures.
 */
export function TimeSlotRow({ hour, minute, days, rides }: TimeSlotRowProps) {
  // Libellé horaire formaté (ex : "08:00")
  const labelMin  = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  // Affiche le libellé uniquement sur les heures entières
  const showLabel = minute === 0;

  return (
    <div style={{ display: "flex", height: 30 * PX_PER_MIN }}>
      {/* Colonne de l'heure (label à gauche) */}
      <div style={{
        width:          44,
        flexShrink:     0,
        display:        "flex",
        alignItems:     "flex-start",
        justifyContent: "flex-end",
        paddingRight:   8,
        paddingTop:     2,
        fontSize:       9,
        fontWeight:     600,
        color:          "#94a3b8",
        letterSpacing:  0.3,
        userSelect:     "none",
      }}>
        {showLabel ? labelMin : ""}
      </div>

      {/* Cellules interactives — une par jour */}
      {days.map((day, di) => (
        <div key={di} style={{
          flex:       1,
          borderTop:  minute === 0 ? "1px solid rgba(0,0,0,0.12)" : "1px dashed rgba(0,0,0,0.03)",
          borderLeft: "1px solid rgba(0,0,0,0.07)",
          position:   "relative",
          display:    "flex",
        }}>
          {/* Passe hasRide pour que TimeCell sache si ce créneau est occupé */}
          <TimeCell
            day={day}
            hour={hour}
            minute={minute}
            hasRide={hasRideInSlot(rides, day, hour, minute)}
          />
        </div>
      ))}
    </div>
  );
}
