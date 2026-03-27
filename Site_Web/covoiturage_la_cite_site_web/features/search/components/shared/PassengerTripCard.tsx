"use client";

/**
 * @file PassengerTripCard.tsx  (v2)
 * @description Carte trajet passager — design proche du wireframe avec badge matching score.
 *
 * Layout :
 *   - Ligne supérieure : photo + nom + note conducteur | badge matching
 *   - Ligne milieu     : départ → arrivée + date + heure
 *   - Ligne inférieure : prix | places dispo | bouton Réserver
 */

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trip } from "@/features/dashboard/types/trip.types";
import { MatchingScore } from "@/features/search/types/search.feature.types";
import {
  FaLocationDot, FaFlag, FaCalendarDays, FaClock, FaStar,
  FaUserGroup, FaArrowRight,
} from "react-icons/fa6";

interface PassengerTripCardProps {
  trip:   Trip;
  score?: MatchingScore;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-CA", {
      weekday: "short", day: "2-digit", month: "short",
    });
  } catch { return dateStr; }
}

function matchColor(score: number): { bg: string; color: string; label: string } {
  if (score >= 80) return { bg: "#e8f5e9", color: "#1b5e20", label: "Excellent" };
  if (score >= 60) return { bg: "#e3f2fd", color: "#0d47a1", label: "Bon match" };
  if (score >= 40) return { bg: "#fff8e1", color: "#e65100", label: "Passable" };
  return { bg: "#fce4ec", color: "#b71c1c", label: "Faible" };
}

export function PassengerTripCard({ trip, score }: PassengerTripCardProps) {
  const router = useRouter();
  const seatsLeft = trip.maxPassengers - trip.passengers.length;
  const mc = score ? matchColor(score.total) : null;

  return (
    <div style={{
      background:    "#fff",
      border:        "1.5px solid #d0d8e8",
      borderRadius:  16,
      padding:       "14px 16px",
      boxShadow:     "0 2px 8px rgba(8,49,110,0.07)",
      display:       "flex",
      flexDirection: "column",
      gap:           10,
      transition:    "box-shadow 0.2s, transform 0.15s",
      cursor:        "default",
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 20px rgba(8,49,110,0.15)";
      (e.currentTarget as HTMLDivElement).style.transform = "translateY(-1px)";
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 8px rgba(8,49,110,0.07)";
      (e.currentTarget as HTMLDivElement).style.transform = "none";
    }}>

      {/* Ligne 1 : conducteur + badge matching */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            position: "relative", width: 42, height: 42, borderRadius: "50%",
            overflow: "hidden", flexShrink: 0,
            border: "2.5px solid #08316e",
            boxShadow: "0 0 0 2px #e8eef8",
          }}>
            <Image
              src={trip.driver.pictureUrl || "/assets/placeholder/placeholer-profile-picture.png"}
              alt={trip.driver.name}
              fill
              style={{ objectFit: "cover" }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/assets/placeholder/placeholer-profile-picture.png"; }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#08316e" }}>
              {trip.driver.name}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#5a6a85" }}>
              <FaStar size={10} color="#f59e0b" />
              <strong style={{ color: "#1a2a45" }}>{trip.driver.rating.toFixed(1)}</strong>
              <span style={{ color: "#c0ccd8" }}>·</span>
              {trip.driver.tripsCount} trajet{trip.driver.tripsCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>

        {/* Badge matching score */}
        {mc && score && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            background: mc.bg, borderRadius: 10, padding: "4px 10px",
            border: `1.5px solid ${mc.color}22`,
          }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: mc.color, lineHeight: 1 }}>
              {score.total}
            </span>
            <span style={{ fontSize: 9, fontWeight: 700, color: mc.color, letterSpacing: "0.04em" }}>
              {mc.label}
            </span>
          </div>
        )}
      </div>

      {/* Séparateur */}
      <div style={{ borderTop: "1px solid #f0f4fb" }} />

      {/* Trajet : départ → arrivée */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        background: "#f6f9ff", borderRadius: 10, padding: "8px 12px",
      }}>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 3 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#08316e" }}>
            <FaLocationDot size={12} color="#08316e" />
            {trip.departure}
          </span>
          <div style={{ display: "flex", justifyContent: "center", paddingLeft: 2 }}>
            <FaArrowRight size={10} color="#90a4c0" />
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 700, color: "#1a2a45" }}>
            <FaFlag size={11} color="#e04a2f" />
            {trip.destination}
          </span>
        </div>
      </div>

      {/* Date et heure */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#5a6a85" }}>
          <FaCalendarDays size={11} color="#08316e" />
          {formatDate(trip.date)}
        </span>
        {trip.time && (
          <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#5a6a85" }}>
            <FaClock size={11} color="#08316e" />
            <strong style={{ color: "#1a2a45" }}>{trip.time}</strong>
          </span>
        )}
        <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#5a6a85", marginLeft: "auto" }}>
          <FaUserGroup size={11} color={seatsLeft > 0 ? "#2e7d32" : "#c62828"} />
          <span style={{
            fontWeight: 700,
            color: seatsLeft > 0 ? "#2e7d32" : "#c62828",
            background: seatsLeft > 0 ? "#e8f5e9" : "#ffebee",
            borderRadius: 6, padding: "1px 7px", fontSize: 11,
          }}>
            {seatsLeft > 0 ? `${seatsLeft} place${seatsLeft > 1 ? "s" : ""}` : "Complet"}
          </span>
        </span>
      </div>

      {/* Prix + bouton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: 22, fontWeight: 800, color: "#08316e" }}>
          +{trip.price}<span style={{ fontSize: 13, fontWeight: 600, color: "#08316e" }}>$</span>
          <span style={{ fontSize: 10, fontWeight: 500, color: "#90a4c0", marginLeft: 3 }}>/ pers.</span>
        </span>

        <button
          disabled={seatsLeft <= 0}
          onClick={() => router.push(`/trajets/${trip.id}`)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            background: seatsLeft > 0 ? "#08316e" : "#b0bcd4",
            color: "#fff",
            border: "none", borderRadius: 10,
            padding: "9px 18px",
            fontSize: 13, fontWeight: 700,
            cursor: seatsLeft > 0 ? "pointer" : "not-allowed",
            transition: "background 0.2s, transform 0.1s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            if (seatsLeft > 0) (e.currentTarget as HTMLButtonElement).style.background = "#0a3d8a";
          }}
          onMouseLeave={(e) => {
            if (seatsLeft > 0) (e.currentTarget as HTMLButtonElement).style.background = "#08316e";
          }}
        >
          {seatsLeft > 0 ? "Voir le trajet" : "Complet"}
        </button>
      </div>
    </div>
  );
}
