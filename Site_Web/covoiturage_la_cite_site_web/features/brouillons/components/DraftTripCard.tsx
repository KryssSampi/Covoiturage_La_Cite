"use client";

/**
 * @file DraftTripCard.tsx
 * @description Carte épurée d'un brouillon de trajet pour la liste.
 * Design inspiré de MapCircuitCard mais simplifié : pas de bouton « Choisir »,
 * pas de sections liées à la recherche.
 */

import { FaArrowRight, FaRegClock, FaMapMarkerAlt, FaRegCalendarAlt } from "react-icons/fa";
import { FaCircleExclamation } from "react-icons/fa6";
import type { DraftTrip } from "@/features/brouillons/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Nombre de champs obligatoires manquants */
function missingFieldsCount(draft: DraftTrip): number {
  let count = 0;
  if (!draft.departureLocation) count++;
  if (!draft.arrivalLocation)   count++;
  if (!draft.departureDate)     count++;
  if (!draft.departureTime)     count++;
  if (!draft.vehicleId)         count++;
  return count;
}

/** Formatte une date ISO en format lisible court */
function formatShortDate(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-CA", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface DraftTripCardProps {
  draft:      DraftTrip;
  isSelected: boolean;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export function DraftTripCard({ draft, isSelected }: DraftTripCardProps) {
  const missing = missingFieldsCount(draft);

  return (
    <div
      style={{
        display:       "flex",
        flexDirection: "column",
        gap:           8,
        padding:       "14px 16px",
        background:    isSelected ? "#f0f4fb" : "#fff",
        borderRadius:  14,
        transition:    "all 0.15s",
      }}
    >
      {/* Départ → Arrivée */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <FaMapMarkerAlt size={12} color="#08316e" />
        <span style={{ fontSize: 14, fontWeight: 700, color: "#08316e" }}>
          {draft.departureLocation || "Départ non défini"}
        </span>
        <FaArrowRight size={10} color="#90a4c0" />
        <span style={{ fontSize: 14, fontWeight: 700, color: "#08316e" }}>
          {draft.arrivalLocation || "Arrivée non définie"}
        </span>
      </div>

      {/* Date et heure */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#5a6a85" }}>
        {draft.departureDate && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <FaRegCalendarAlt size={11} />
            {formatShortDate(draft.departureDate)}
          </span>
        )}
        {draft.departureTime && (
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <FaRegClock size={11} />
            {draft.departureTime}
          </span>
        )}
        {!draft.departureDate && !draft.departureTime && (
          <span style={{ color: "#9ca3af", fontStyle: "italic" }}>Date et heure non définies</span>
        )}
      </div>

      {/* Prix + places */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 12, color: "#5a6a85" }}>
        <span>
          <strong style={{ color: "#08316e" }}>{draft.pricePerPassenger} $</strong> / passager
        </span>
        <span>
          <strong style={{ color: "#08316e" }}>{draft.availableSeats}</strong> place{draft.availableSeats > 1 ? "s" : ""} dispo.
        </span>
      </div>

      {/* Badge champs manquants */}
      {missing > 0 && (
        <div style={{
          display:      "flex",
          alignItems:   "center",
          gap:          5,
          fontSize:     11,
          fontWeight:   600,
          color:        "#c2410c",
          background:   "#fff7ed",
          padding:      "3px 8px",
          borderRadius: 6,
          width:        "fit-content",
        }}>
          <FaCircleExclamation size={11} />
          {missing} champ{missing > 1 ? "s" : ""} manquant{missing > 1 ? "s" : ""}
        </div>
      )}

      {/* Date de modification */}
      <span style={{ fontSize: 10, color: "#9ca3af" }}>
        Modifié le {formatShortDate(draft.updatedAt)}
      </span>
    </div>
  );
}
