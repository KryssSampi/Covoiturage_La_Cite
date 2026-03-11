"use client";

import { useState } from "react";
import { addMonths, addWeeks, startOfWeek } from "date-fns";
import { FaCalendar, FaClock } from "react-icons/fa6";

import { getUserConnected, Language, useAppState } from "@/core/state/app_state";
import { Role }                                    from "@/features/planner/types/calendar.types";
import { TODAY, DRIVER_STATUS_COLORS, PASSENGER_STATUS_COLORS } from "@/features/planner/constants/calendar.constants";
import { useCalendarWindow }                       from "@/features/planner/hooks/useCalendarWindow";
import { CalendarNav }                             from "@/features/planner/components/shared/CalendarNav";
import { CalendarCarousel }                        from "@/features/planner/components/shared/CalendarCarousel";
import { usePlannerContext }                       from "@/features/planner/context/PlannerContext";

// ─── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────

/**
 * Calendrier principal de l'application.
 * Orchestre la navigation, la gestion des vues (mois / semaine)
 * et distribue l'état aux composants enfants.
 */
export default function SuperCalendar() {
  const user  = getUserConnected();
  const role  = user?.role.toString() ?? "passenger";
  const rides = usePlannerContext().rides;

  // Jour sélectionné partagé avec RideArea via PlannerContext
  const { currentDay, setCurrentDay } = usePlannerContext();

  // Vue active : "month" ou "week"
  const [view, setView] = useState("month");

  // État de navigation indépendant pour chaque vue
  const monthCal = useCalendarWindow("month");
  const weekCal  = useCalendarWindow("week");

  const appState = useAppState();
  const isFr     = appState.lang === Language.FR;

  // Calcule la date pivot en fonction du décalage (mois ou semaine)
  const monthPivot = (off: number): Date => addMonths(TODAY, monthCal.offset + off);
  const weekPivot  = (off: number): Date => addWeeks(TODAY,  weekCal.offset  + off);

  // Contrôle l'animation de transition lors du basculement de vue
  const [disposing, setDisposing] = useState(false);

  /** Bascule entre les vues avec une transition fade + translateY */
  function switchView(v: string): void {
    if (v === view) return;
    setDisposing(true);
    setTimeout(() => {
      setView(v);
      setDisposing(false);
    }, 220);
  }

  /** Bascule vers la vue semaine et positionne le calendrier sur la semaine cliquée.
   * Met également à jour currentDay dans PlannerContext. */
  function handleDayClick(date: Date): void {
    // Synchronise le jour sélectionné dans le contexte partagé (RideArea)
    setCurrentDay(date);
    switchView("week");
    const msPerWeek = 7 * 86400000;
    const diffWeeks = Math.round(
      (startOfWeek(date, { weekStartsOn: 0 }).getTime()
        - startOfWeek(TODAY, { weekStartsOn: 0 }).getTime())
      / msPerWeek
    );
    weekCal.jumpTo(diffWeeks);
  }

  return (
    <div style={{
      background:     "linear-gradient(160deg,#DfDfDf 0%,#efefef 60%,#FFFFFF 100%)",
      position:       "relative",
      minHeight:      "50vh",
      display:        "flex",
      alignItems:     "center",
      justifyContent: "center",
      fontFamily:     "'Segoe UI', system-ui, sans-serif",
      padding:        0,
    }}>
      <div className="w-full" style={{
        backdropFilter: "blur(24px)",
        border:         "1px solid rgba(0,0,0,0.10)",
        borderRadius:   20,
        display:        "flex",
        flexDirection:  "column",
        overflow:       "hidden",
      }}>

        {/* ── En-tête : titre + badge rôle + toggle de vue ── */}
        <div style={{
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "14px 16px 0",
          flexShrink:     0,
        }}>
          {/* Titre et badge rôle */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FaCalendar size={29} color="#08316e" />
            <span style={{
              fontSize:      18, fontWeight: 700,
              color:         "#08316e",
              letterSpacing: 1.5, textTransform: "uppercase",
            }}>
              Agenda
            </span>
            <span style={{
              fontSize:   15,
              padding:    "2px 8px",
              borderRadius: 20,
              background: role === Role.DRIVER ? "rgba(74,222,128,0.15)" : "rgba(96,165,250,0.15)",
              color:      role === Role.DRIVER ? "#4ade80" : "#60a5fa",
              fontWeight: 700, letterSpacing: 0.5,
            }}>
              {role === Role.DRIVER ? "Conducteur" : "Passager"}
            </span>
          </div>

          {/* Toggle Mois / Semaine */}
          <div style={{
            display:      "flex",
            background:   "rgba(0,0,0,0.06)",
            borderRadius: 10,
            padding:      3,
            gap:          2,
            border:       "1px solid rgba(0,0,0,0.08)",
          }}>
            {(["month", "week"] as const).map((v) => (
              <button
                key={v}
                onClick={() => switchView(v)}
                style={{
                  padding:       "5px 12px",
                  borderRadius:  8,
                  border:        "none",
                  cursor:        "pointer",
                  fontSize:      15,
                  fontWeight:    700,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  background:    view === v ? "#08316e" : "transparent",
                  color:         view === v ? "#fff" : "#94a3b8",
                  transition:    "all 0.2s",
                  display:       "flex",
                  alignItems:    "center",
                  gap:           5,
                }}
              >
                {v === "month" ? <FaCalendar size={19} /> : <FaClock size={19} />}
                {v === "month" ? "Mois" : "Semaine"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Barre de navigation (mois/année ou intervalle semaine) ── */}
        <CalendarNav
          isFr={isFr}
          view={view}
          monthOffset={monthCal.offset}
          weekOffset={weekCal.offset}
          onNavigate={view === "month" ? monthCal.navigate : weekCal.navigate}
          onMonthJump={monthCal.jumpTo}
          onWeekJump={weekCal.jumpTo}
        />

        {/* ── Grille du calendrier (avec transition de vue) ── */}
        <div style={{
          flex:      1,
          display:   "flex",
          flexDirection: "column",
          padding:   "0 12px 16px",
          opacity:   disposing ? 0 : 1,
          transform: disposing ? "translateY(8px)" : "translateY(0)",
          transition: "opacity 0.22s, transform 0.22s",
        }}>
          <CalendarCarousel
            view={view}
            isFr={isFr}
            offset={view === "month" ? monthCal.offset : weekCal.offset}
            window4={view === "month" ? monthCal.window4 : weekCal.window4}
            animDir={view === "month" ? monthCal.animDir : weekCal.animDir}
            rides={rides}
            role={role || "passenger"}
            selectedDay={currentDay}
            onDayClick={handleDayClick}
            pivotFn={view === "month" ? monthPivot : weekPivot}
          />
        </div>

        {/* ── Légende des statuts ── */}
        <div style={{
          padding:   "10px 16px 14px",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display:   "flex",
          gap:       12,
          flexWrap:  "wrap",
        }}>
          {(role === Role.DRIVER
            ? Object.entries(DRIVER_STATUS_COLORS)
            : Object.entries(PASSENGER_STATUS_COLORS)
          ).slice(0, 5).map(([status, colors]) => (
            <div key={status} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 12, height: 12, borderRadius: "50%", background: colors.bg }} />
              <span style={{ fontSize: 12, color: "rgba(0,0,0,0.7)", textTransform: "capitalize" }}>
                {status}
              </span>
            </div>
          ))}

          {/* Indicateur de saturation */}
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{
              width: 22, height: 12, borderRadius: 3,
              background: "linear-gradient(100deg,hsl(142,55%,88%),hsl(0,75%,88%))",
            }} />
            <span style={{ fontSize: 12, color: "rgba(0,0,0,0.7)" }}>Saturation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
