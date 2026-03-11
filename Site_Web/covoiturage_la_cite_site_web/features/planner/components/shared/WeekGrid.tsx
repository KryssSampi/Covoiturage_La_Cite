"use client";

/**
 * @file WeekGrid.tsx
 * @description Grille hebdomadaire avec affichage horaire en défilement vertical.
 *
 * Reçoit `selectedDay` depuis CalendarCarousel pour :
 *   - Mettre en valeur le header du jour sélectionné
 *   - Mettre en valeur la colonne WeekColumn correspondante
 *
 * Les headers sont cliquables : un clic appelle `onDayClick` qui
 * remonte jusqu'à SuperCalendar → setCurrentDay dans PlannerContext.
 */

import { useRef, useEffect }                          from "react";
import { format, startOfWeek, addDays, getDay, isToday } from "date-fns";
import {
  DAYS_FR, DAYS_EN, DAY_START_HOUR, PX_PER_MIN,
}                                                     from "@/features/planner/constants/calendar.constants";
import { WeekColumn }                                 from "@/features/planner/components/shared/WeekColumn";
import { TimeSlotRow }                                from "@/features/planner/components/shared/TimeSlotRow";
import { PublishedTrip, Reservation } from "@/features/dashboard/types";

// ─── PROPS ────────────────────────────────────────────────────────────────────

interface WeekGridProps {
  /** Activer les libellés en français */
  isFr:        boolean;
  /** Date de référence : la semaine affichée est celle du pivot */
  pivot:       Date;
  rides:       (PublishedTrip | Reservation)[];
  role:        string;
  /** Jour sélectionné dans PlannerContext */
  selectedDay: Date;
  /** Callback : clic sur un header → met à jour currentDay */
  onDayClick:  (date: Date) => void;
}

// ─── COMPOSANT ────────────────────────────────────────────────────────────────

export function WeekGrid({ isFr, pivot, rides, role, selectedDay, onDayClick }: WeekGridProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const weekStart = startOfWeek(pivot, { weekStartsOn: 0 });
  const days      = isFr ? DAYS_FR : DAYS_EN;
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Scroll initial vers DAY_START_HOUR pour éviter d'afficher 00h00 en haut
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = DAY_START_HOUR * 60 * PX_PER_MIN - 10;
    }
  }, []);

  // Génère les créneaux horaires : une entrée toutes les 30 minutes de 00h00 à 23h30
  const slots: { hour: number; minute: number }[] = [];
  for (let h = 0; h < 24; h++) {
    for (const m of [0, 30]) {
      slots.push({ hour: h, minute: m });
    }
  }

  return (
    <div style={{
      display:         "flex",
      flexDirection:   "column",
      flex:            1,
      overflowX:       "hidden",
      msOverflowStyle: "none",
      scrollbarWidth:  "none",
    }}>

      {/* En-têtes des jours — cliquables */}
      <div style={{ display: "flex", paddingLeft: 44, flexShrink: 0 }}>
        {weekDays.map((d, i) => {
          const todayCol   = isToday(d);
          const isSelected = d.toDateString() === selectedDay.toDateString();

          // Fond du header selon l'état
          const headerBg = (todayCol && isSelected)
            ? "#08316e"                               // today + selected : plein
            : todayCol
              ? "rgba(8,49,110,0.10)"                 // today seul : teinte
              : isSelected
                ? "rgba(8,49,110,0.07)"               // selected seul : très pâle
                : "transparent";

          // Bordure basse indicateur
          const headerBorderBottom = isSelected
            ? "2.5px solid #08316e"
            : todayCol
              ? "2px dashed rgba(8,49,110,0.4)"
              : "1px solid rgba(0,0,0,0.06)";

          // Couleur du nom du jour
          const dayNameColor = (todayCol || isSelected)
            ? "#08316e"
            : "#6b7280";

          // Couleur du numéro
          const dayNumColor = (todayCol && isSelected)
            ? "#ffffff"
            : (todayCol || isSelected)
              ? "#08316e"
              : "#111827";

          // Fond du cercle numéro
          const circleBg = (todayCol && isSelected)
            ? "rgba(255,255,255,0.22)"
            : isSelected
              ? "rgba(8,49,110,0.10)"
              : todayCol
                ? "rgba(8,49,110,0.08)"
                : "transparent";

          return (
            <div
              key={i}
              onClick={() => onDayClick(d)}
              style={{
                flex:           1,
                textAlign:      "center",
                padding:        "6px 0 8px",
                borderTop:      "1px solid rgba(0,0,0,0.06)",
                borderBottom:   headerBorderBottom,
                borderLeft:     isSelected
                  ? "1px solid rgba(8,49,110,0.15)"
                  : "1px solid rgba(0,0,0,0.06)",
                borderRight:    "1px solid rgba(0,0,0,0.06)",
                background:     headerBg,
                cursor:         "pointer",
                transition:     "background 0.18s",
                userSelect:     "none",
              }}
            >
              {/* Nom abrégé du jour */}
              <div style={{
                fontSize:      11,
                fontWeight:    700,
                color:         dayNameColor,
                letterSpacing: 0.8,
                textTransform: "uppercase",
              }}>
                {days[getDay(d)].slice(0, 3)}
              </div>

              {/* Numéro du jour dans un cercle */}
              <div style={{
                marginTop:      3,
                width:          28,
                height:         28,
                borderRadius:   "50%",
                background:     circleBg,
                display:        "inline-flex",
                alignItems:     "center",
                justifyContent: "center",
                fontSize:       16,
                fontWeight:     (todayCol || isSelected) ? 800 : 500,
                color:          dayNumColor,
              }}>
                {format(d, "d")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Zone scrollable : colonnes + lignes horaires */}
      <div
        ref={scrollRef}
        style={{
          overflowY:       "auto",
          flex:            1,
          position:        "relative",
          msOverflowStyle: "none",
          scrollbarWidth:  "none",
        }}
      >
        {/* Colonnes des trajets (position absolue sur toute la hauteur du contenu) */}
        <div style={{
          display:  "flex",
          position: "absolute",
          top:      0,
          left:     44,
          right:    0,
          height:   `${24 * 2 * 30 * PX_PER_MIN}px`,
          zIndex:   0,
        }}>
          {weekDays.map((d, i) => (
            <WeekColumn
              key={i}
              day={d}
              rides={rides}
              role={role}
              selectedDay={selectedDay}
            />
          ))}
        </div>

        {/* Lignes des créneaux horaires */}
        <div style={{ position: "relative", zIndex: 1 }}>
          {slots.map((s, i) => (
            <TimeSlotRow key={i} {...s} days={weekDays} rides={rides} role={role} />
          ))}
        </div>
      </div>
    </div>
  );
}
