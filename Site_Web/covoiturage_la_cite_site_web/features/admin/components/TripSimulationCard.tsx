"use client";

/**
 * TripSimulationCard — Carte affichant un trajet avec :
 *  - Menu de simulation d'événements (pénalités, annulations…)
 *  - Section GPS Autoplay : déplace le conducteur le long de la polyline à 50 km/h
 */

import React, { useState } from "react";
import {
  FaClock, FaBan, FaCircleCheck,
  FaGavel, FaCarBurst, FaCircleXmark, FaUserXmark,
  FaChevronDown, FaLocationArrow, FaStop,
} from "react-icons/fa6";
import { FaPersonRunning } from "react-icons/fa6";
import type { AdminTrip, SimulationEvent } from "@/features/admin/types/adminTrips";
import type { AutoplayState } from "@/features/admin/hooks/useAdminTrips";

// ─── Configuration des événements simulables ──────────────────────────────────

interface EventConfig {
  value: SimulationEvent;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const SIMULATION_EVENTS: EventConfig[] = [
  { value: "retard_15_30",         label: "Retard 15–30 min",           icon: <FaClock size={12} />,         color: "#c8960a", description: "Pénalité 5$ au conducteur, -5 pts réputation" },
  { value: "retard_30_60",         label: "Retard 30–60 min",           icon: <FaClock size={12} />,         color: "#e05a10", description: "Pénalité 10$ au conducteur, -10 pts réputation" },
  { value: "retard_60plus",        label: "Retard > 60 min (auto-cancel)", icon: <FaCircleXmark size={12} />, color: "#e03050", description: "Annulation automatique + remboursement 100% passagers" },
  { value: "annulation_conducteur", label: "Annulation conducteur",       icon: <FaBan size={12} />,           color: "#e03050", description: "Pénalité 15$ + remboursement selon délai" },
  { value: "no_show_conducteur",   label: "No-show conducteur",          icon: <FaPersonRunning size={12} />, color: "#e03050", description: "Pénalité 50$ + suspension 7 jours + remboursement 100%" },
  { value: "no_show_passager",     label: "No-show passager",            icon: <FaUserXmark size={12} />,     color: "#c8960a", description: "Pénalité passager (prix total), 85% versé au conducteur" },
  { value: "trajet_complete",      label: "Trajet complété",             icon: <FaCircleCheck size={12} />,   color: "#0aad6a", description: "Capture du paiement : 85% conducteur / 15% plateforme" },
  { value: "litige",               label: "Signalement validé",          icon: <FaGavel size={12} />,         color: "#e03050", description: "Pénalité 100$ + suspension 30 jours" },
  { value: "accident",             label: "Accident (force-annulation)", icon: <FaCarBurst size={12} />,      color: "#7a90b8", description: "Annulation forcée + remboursement 100% sans pénalité" },
];

// ─── Badges de statut ─────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
  published:   { bg: "rgba(0,152,200,0.12)",  text: "#0098c8",  label: "Publié"   },
  confirmed:   { bg: "rgba(10,173,106,0.12)", text: "#0aad6a",  label: "Confirmé" },
  in_progress: { bg: "rgba(200,150,10,0.12)", text: "#c8960a",  label: "En cours" },
  completed:   { bg: "rgba(10,173,106,0.12)", text: "#0aad6a",  label: "Terminé"  },
  cancelled:   { bg: "rgba(224,48,80,0.12)",  text: "#e03050",  label: "Annulé"   },
};

// ─── Props ────────────────────────────────────────────────────────────────────

interface TripSimulationCardProps {
  trip: AdminTrip;
  onSimulate: (tripId: string, event: SimulationEvent) => Promise<void>;
  busy: boolean;
  onStartAutoplay?: (trip: AdminTrip) => Promise<void>;
  onStopAutoplay?: (tripId: string) => void;
  autoplayState?: AutoplayState;
  autoplayProgress?: number;
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function TripSimulationCard({
  trip, onSimulate, busy,
  onStartAutoplay, onStopAutoplay,
  autoplayState, autoplayProgress = 0,
}: TripSimulationCardProps) {
  const [selectedEvent, setSelectedEvent] = useState<SimulationEvent | "">("");
  const [open, setOpen]                   = useState(false);

  const selectedConfig = SIMULATION_EVENTS.find((e) => e.value === selectedEvent);
  const badge = STATUS_BADGE[trip.status] ?? { bg: "rgba(122,144,184,0.1)", text: "#7a90b8", label: trip.status };

  const departLabel  = trip.departure?.label  ?? (trip.departure as unknown as string)  ?? "–";
  const arrivalLabel = trip.arrival?.label ?? (trip.arrival as unknown as string) ?? "–";

  const hasCoords = !!(trip.departure?.coordinates && trip.arrival?.coordinates) ||
                    !!(Array.isArray(trip.polyline) && trip.polyline.length >= 2);

  const isRunning = autoplayState === 'running';
  const isDone    = autoplayState === 'done';
  const isError   = autoplayState === 'error';

  async function handleSimulate() {
    if (!selectedEvent) return;
    await onSimulate(trip.id, selectedEvent);
    setSelectedEvent("");
  }

  return (
    <div className="bg-white rounded-xl border border-[rgba(8,49,110,0.12)] shadow-sm overflow-hidden">

      {/* ── En-tête du trajet ─────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[rgba(8,49,110,0.02)]"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <FaChevronDown
            size={11}
            className="text-[#7a90b8] transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          />
          <div>
            <div className="text-sm font-bold text-[#0d1f3c] font-[Syne]">
              {departLabel} → {arrivalLabel}
            </div>
            <div className="text-[11px] text-[#7a90b8] mt-0.5">
              {trip.id} · Conducteur: <span className="font-semibold text-[#08316e]">{trip.driverName}</span>
              {trip.pricePerPassenger > 0 && (
                <span> · {(trip.pricePerPassenger * 1.15).toFixed(2)} $/passager</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isRunning && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[rgba(200,150,10,0.12)] text-[#c8960a] animate-pulse">
              GPS {autoplayProgress}%
            </span>
          )}
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ background: badge.bg, color: badge.text }}>
            {badge.label}
          </span>
          <span className="text-[11px] text-[#7a90b8]">{trip.totalPassengers} passager(s)</span>
        </div>
      </div>

      {/* ── Détails dépliables ────────────────────────────────────────────── */}
      {open && (
        <div className="border-t border-[rgba(8,49,110,0.08)] px-4 py-3 bg-[rgba(240,244,251,0.5)] flex flex-col gap-4">

          {/* Liste des réservations */}
          {trip.reservations.length > 0 && (
            <div>
              <div className="text-[10px] text-[#7a90b8] uppercase tracking-wider mb-1.5">
                Réservations ({trip.reservations.length})
              </div>
              <div className="flex flex-col gap-1">
                {trip.reservations.map((r) => (
                  <div key={r.id} className="flex items-center justify-between text-[11px] px-2 py-1 rounded-lg bg-white border border-[rgba(8,49,110,0.07)]">
                    <span className="text-[#0d1f3c] font-medium">{r.passengerName}</span>
                    <span className="text-[#7a90b8]">{r.id}</span>
                    <span className="font-semibold" style={{ color: STATUS_BADGE[r.status]?.text ?? "#7a90b8" }}>
                      {STATUS_BADGE[r.status]?.label ?? r.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Sélecteur d'événement ─────────────────────────────────────── */}
          <div>
            <div className="text-[10px] text-[#7a90b8] uppercase tracking-wider font-semibold mb-1.5">
              Simulation d&apos;événement
            </div>
            <div className="flex flex-wrap gap-2.5 items-end">
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value as SimulationEvent | "")}
                className="bg-white border-[1.5px] border-[rgba(8,49,110,0.18)] rounded-[9px] px-3 py-2 text-[#0d1f3c] text-xs font-medium outline-none min-w-60 cursor-pointer"
              >
                <option value="">— Choisir un événement —</option>
                {SIMULATION_EVENTS.map((ev) => (
                  <option key={ev.value} value={ev.value}>{ev.label}</option>
                ))}
              </select>

              {selectedConfig && (
                <div className="text-[11px] py-1.5 px-3 rounded-lg border flex items-center gap-1.5" style={{ color: selectedConfig.color, borderColor: selectedConfig.color + "33", background: selectedConfig.color + "11" }}>
                  {selectedConfig.icon} {selectedConfig.description}
                </div>
              )}

              <button
                onClick={() => void handleSimulate()}
                disabled={!selectedEvent || busy}
                className="flex items-center gap-2 px-4 py-2 text-white border-none rounded-[9px] font-bold text-[12px] cursor-pointer disabled:opacity-40"
                style={{ background: "linear-gradient(135deg,#08316e,#1a5cb0)" }}
              >
                Simuler l&apos;événement
              </button>
            </div>
          </div>

          {/* ── Section GPS Autoplay ──────────────────────────────────────── */}
          <div className="border-t border-[rgba(8,49,110,0.08)] pt-3">
            <div className="text-[10px] text-[#7a90b8] uppercase tracking-wider font-semibold mb-2">
              Simulation GPS Autoplay
            </div>

            {!isRunning && !isDone && !isError && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => void onStartAutoplay?.(trip)}
                  disabled={busy || !hasCoords}
                  title={!hasCoords ? "Coordonnées GPS manquantes pour ce trajet" : ""}
                  className="flex items-center gap-2 px-4 py-2 rounded-[9px] font-bold text-[12px] text-white cursor-pointer disabled:opacity-40"
                  style={{ background: "linear-gradient(135deg,#0aad6a,#07855a)" }}
                >
                  <FaLocationArrow size={11} />
                  Déplacer le conducteur (50 km/h)
                </button>
                {!hasCoords && (
                  <span className="text-[11px] text-[#e03050]">Coordonnées GPS absentes</span>
                )}
              </div>
            )}

            {isRunning && (
              <div className="flex items-center gap-3">
                <div className="flex-1 max-w-50">
                  <div className="h-2 rounded-full bg-[rgba(8,49,110,0.1)] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${autoplayProgress}%`, background: "linear-gradient(90deg,#0aad6a,#07855a)" }}
                    />
                  </div>
                  <div className="text-[10px] text-[#7a90b8] mt-1">
                    Progression : {autoplayProgress}% · conducteur en déplacement…
                  </div>
                </div>
                <button
                  onClick={() => onStopAutoplay?.(trip.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-[9px] font-bold text-[11px] text-white cursor-pointer border-none"
                  style={{ background: "#e03050" }}
                >
                  <FaStop size={10} /> Arrêter
                </button>
              </div>
            )}

            {isDone && (
              <div className="flex items-center gap-2 text-[11px] text-[#0aad6a] font-semibold">
                <FaCircleCheck size={13} /> Trajet complété — les passagers ont reçu la notification.
              </div>
            )}

            {isError && (
              <div className="flex items-center gap-2 text-[11px] text-[#e03050] font-semibold">
                <FaCircleXmark size={13} /> Erreur lors de la simulation GPS.
                <button
                  onClick={() => void onStartAutoplay?.(trip)}
                  className="underline cursor-pointer"
                >
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
