"use client";

import { format, getHours, getMinutes } from "date-fns";
import { FaArrowRight } from "react-icons/fa6";
import { PublishedTrip, Reservation } from "@/features/dashboard/types";
import { getStatusColor } from "@/features/planner/utils/calendar.utils";
import { normalizeRide } from "@/features/planner/utils/ride.normalizer";

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface RideCellProps {
  ride:     PublishedTrip | Reservation;
  role:     string;
  /** Largeur de la colonne parente (px) — réservé pour le positionnement futur */
  colWidth: number;
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────

/** Nombre de pixels par minute dans la vue hebdomadaire */
const PX_PER_MIN = 1.6;

// ─── COMPOSANT ────────────────────────────────────────────────────────────────

/**
 * Affiche un trajet sous forme de bloc positionné dans la colonne hebdomadaire.
 * La position verticale et la hauteur sont calculées à partir de l'heure de début/fin.
 */
export function RideCell({ ride, role, colWidth: _colWidth }: RideCellProps) { // eslint-disable-line @typescript-eslint/no-unused-vars
  // Normalisation du trajet pour un accès uniforme aux propriétés
  const normalized = normalizeRide(ride);

  // Calcul de la position verticale et de la hauteur du bloc
  const startMin = getHours(normalized.start) * 60 + getMinutes(normalized.start);
  const durMin   = Math.round((normalized.end.getTime() - normalized.start.getTime()) / 60000);
  const top      = startMin * PX_PER_MIN;
  const height   = Math.max(durMin * PX_PER_MIN, 28);

  const colors   = getStatusColor(normalized.status, role);
  const startFmt = format(normalized.start, "HH:mm");

  // Le bloc est "petit" si la hauteur est inférieure à 36px (omet les détails)
  const small = height < 36;

  return (
    <div style={{
      position:   "absolute",
      top,
      left:       2,
      right:      2,
      height,
      background: colors.bg,
      borderRadius: 7,
      padding:    small ? "2px 5px" : "5px 7px",
      overflow:   "hidden",
      boxShadow:  `0 2px 8px ${colors.light}`,
      zIndex:     2,
      display:    "flex",
      flexDirection: "column",
      justifyContent: "center",
      cursor:     "pointer",
    }}>
      {/* Heure de départ */}
      <span style={{ fontSize: 20, fontWeight: 700, color: colors.text, opacity: 0.85 }}>
        {startFmt}
      </span>

      {/* Origine → Destination (masqués si le bloc est trop petit) */}
      {!small && (
        <div style={{ display: "flex", alignItems: "center", gap: 3, marginTop: 2 }}>
          <span title={normalized.origin} style={{
            fontSize: 18, color: colors.text, opacity: 0.9,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 60,
          }}>
            {normalized.origin}
          </span>
          <FaArrowRight size={22} color={colors.text} style={{ opacity: 0.8, flexShrink: 0 }} />
          <span title={normalized.destination} style={{
            fontSize: 18, color: colors.text, opacity: 0.9,
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 60,
          }}>
            {normalized.destination}
          </span>
        </div>
      )}
    </div>
  );
}
