"use client";

import { useRef } from "react";
import { TRANSITION_MS } from "@/features/planner/constants/calendar.constants";
import { MonthGrid } from "@/features/planner/components/shared/MonthGrid";
import { WeekGrid } from "@/features/planner/components/shared/WeekGrid";
import { PublishedTrip , Reservation } from "@/features/dashboard/types";

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface CalendarCarouselProps {
  /** Activer les libellés en français */
  isFr:        boolean;
  /** Vue active ("month" ou "week") */
  view:        string;
  /** Décalage courant (non utilisé directement, injecté via pivotFn) */
  offset:      number;
  /** Fenêtre glissante de 4 offsets pour pré-rendre les grilles adjacentes */
  window4:     number[];
  /** Direction de l'animation en cours ("next", "prev", ou null) */
  animDir:     string | null;
  rides:       (PublishedTrip | Reservation)[];
  role:        string;
  /** Jour sélectionné dans PlannerContext — distribué aux grilles */
  selectedDay: Date;
  /** Callback pour le clic sur un jour (DayCell mois ou header semaine) */
  onDayClick:  (date: Date) => void;
  /** Calcule la date pivot pour un offset donné */
  pivotFn:     (off: number) => Date;
}

// ─── COMPOSANT ────────────────────────────────────────────────────────────────

/**
 * Carrousel animé affichant 4 grilles côte à côte.
 * La grille courante (index 1 du window4) est toujours visible au centre.
 * La transition CSS translateX crée l'effet de glissement lors de la navigation.
 */
export function CalendarCarousel({
  isFr,
  view,
  // offset n'est pas utilisé directement : la date pivot est calculée via pivotFn(off)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  offset: _unusedOffset,
  window4,
  animDir,
  rides,
  role,
  selectedDay,
  onDayClick,
  pivotFn,
}: CalendarCarouselProps) {
  const trackRef = useRef(null);

  // Position de la piste selon l'animation :
  //   - repos   : -25%  → affiche la 2e grille (index 1 = courant)
  //   - "next"  : -50%  → glisse vers la 3e grille
  //   - "prev"  :   0%  → glisse vers la 1re grille
  const trackTranslate = animDir === "next"
    ? "translateX(-50%)"
    : animDir === "prev"
      ? "translateX(0%)"
      : "translateX(-25%)";

  return (
    <div style={{ overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
      <div
        ref={trackRef}
        style={{
          display:    "flex",
          maxHeight:  "70vh",
          flex:       1,
          transform:  trackTranslate,
          transition: animDir
            ? `transform ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`
            : "none",
          // Piste 4× plus large que le conteneur : chaque grille occupe 25%
          width: "400%",
        }}
      >
        {window4.map((off) => {
          const pivot = pivotFn(off);
          return (
            <div key={off} style={{
              width:         "25%",
              flexShrink:    0,
              display:       "flex",
              flexDirection: "column",
            }}>
              {view === "month"
                ? <MonthGrid isFr={isFr} pivot={pivot} rides={rides} role={role} selectedDay={selectedDay} onDayClick={onDayClick} />
                : <WeekGrid  isFr={isFr} pivot={pivot} rides={rides} role={role} selectedDay={selectedDay} onDayClick={onDayClick} />
              }
            </div>
          );
        })}
      </div>
    </div>
  );
}
