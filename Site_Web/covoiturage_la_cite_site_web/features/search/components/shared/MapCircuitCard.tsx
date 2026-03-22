"use client";

/**
 * @file MapCircuitCard.tsx  (v2)
 * @description Carte circuit conducteur — design wireframe avec miniature de carte statique.
 *
 * Layout (identique wireframe) :
 *   - Miniature OSM statique (left)
 *   - Titre + résumé de route
 *   - Durée + Distance (grandes valeurs)
 *   - Bouton Publier
 */

import { FaArrowRight, FaCar } from "react-icons/fa6";
import { MapCircuit } from "@/features/search/types/search.feature.types";
import { Language, useAppState } from "@/core/state/app_state";

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const min = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${min}`;
  return `${h}h${min > 0 ? `${min}` : ""}`;
}

function formatDurationUnit(seconds: number): string {
  return seconds >= 3600 ? "" : "min";
}

function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(1);
}

// Génère une URL de tuile statique centrée sur le midpoint du circuit
function staticMapUrl(circuit: MapCircuit): string {
  const [dLng, dLat] = circuit.departureCoords;
  const [aLng, aLat] = circuit.arrivalCoords;
  const cLat = (dLat + aLat) / 2;
  const cLng = (dLng + aLng) / 2;
  // OpenStreetMap tile standard — zoom 12
  const zoom = 11;
  return `https://tile.openstreetmap.org/${zoom}/${lonToTile(cLng, zoom)}/${latToTile(cLat, zoom)}.png`;
}

function lonToTile(lon: number, zoom: number): number {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function latToTile(lat: number, zoom: number): number {
  return Math.floor(
    (1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2 * Math.pow(2, zoom)
  );
}

// Badge couleur selon rang
function rankStyle(idx: number, isFR: boolean): { bg: string; color: string; label: string } {
  if (idx === 0) return { bg: "#08316e", color: "#fff",      label: isFR ? "Principal" : "Main" };
  if (idx === 1) return { bg: "#1565c0", color: "#fff",      label: `Alt. ${idx}` };
  if (idx === 2) return { bg: "#1976d2", color: "#fff",      label: `Alt. ${idx}` };
  return           { bg: "#e8eef8",    color: "#08316e",    label: `Alt. ${idx}` };
}

interface MapCircuitCardProps {
  circuit:    MapCircuit;
  isActive:   boolean;
  onSelect:   (index: number) => void;
  onPublish?: (circuit: MapCircuit) => void;
  /** Déclenché quand le conducteur choisit ce circuit pour créer un trajet */
  onChoose?:  (circuit: MapCircuit) => void;
}

export function MapCircuitCard({ circuit, isActive, onSelect, onPublish, onChoose }: MapCircuitCardProps) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const rank = rankStyle(circuit.routeIndex, isFR);

  return (
    <div
      onClick={() => onSelect(circuit.routeIndex)}
      role="button"
      aria-pressed={isActive}
      style={{
        display:    "flex",
        gap:        0,
        background: "#fff",
        border:     `2px solid ${isActive ? "#08316e" : "#d0d8e8"}`,
        borderRadius: 16,
        overflow:   "hidden",
        cursor:     "pointer",
        boxShadow:  isActive
          ? "0 6px 20px rgba(8,49,110,0.18)"
          : "0 1px 5px rgba(8,49,110,0.06)",
        transition: "all 0.2s",
      }}
    >
      {/* Miniature carte */}
      <div style={{
        width:      130,
        minHeight:  100,
        flexShrink: 0,
        position:   "relative",
        background: "#e8eef8",
        overflow:   "hidden",
      }}>
        {/* Fond statique OSM */}
        <div style={{
          position: "absolute", inset: 0,
          background: `url(${staticMapUrl(circuit)}) center/cover no-repeat`,
          filter: isActive ? "none" : "saturate(0.6)",
          transition: "filter 0.3s",
        }} />

        {/* Markers A et B */}
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "#08316e", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700,
            boxShadow: "0 2px 6px rgba(8,49,110,0.35)",
          }}>A</div>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            background: "#e04a2f", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12, fontWeight: 700,
            boxShadow: "0 2px 6px rgba(224,74,47,0.35)",
          }}>B</div>
        </div>

        {/* Badge rang */}
        <div style={{
          position: "absolute", top: 6, left: 6,
          background: rank.bg, color: rank.color,
          fontSize: 9, fontWeight: 700, letterSpacing: "0.04em",
          borderRadius: 6, padding: "2px 6px",
        }}>
          {rank.label}
        </div>
      </div>

      {/* Contenu */}
      <div style={{
        flex: 1, padding: "12px 14px",
        display: "flex", flexDirection: "column", gap: 6,
        justifyContent: "space-between",
      }}>
        {/* Départ → Arrivée */}
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#5a6a85", flexWrap: "wrap" }}>
          <span style={{ fontWeight: 700, color: "#08316e" }}>{circuit.departureLabel}</span>
          <FaArrowRight size={9} color="#90a4c0" />
          <span style={{ fontWeight: 700, color: "#08316e" }}>{circuit.arrivalLabel}</span>
        </div>

        {/* Résumé de route */}
        {circuit.summary && (
          <p style={{ margin: 0, fontSize: 11, color: "#5a6a85", lineHeight: 1.4 }}>
            via {circuit.summary}
          </p>
        )}

        {/* Métriques */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#08316e", lineHeight: 1 }}>
              {formatDuration(circuit.duration)}
              <span style={{ fontSize: 12, fontWeight: 500, color: "#5a6a85" }}>
                {" "}{formatDurationUnit(circuit.duration)}
              </span>
            </span>
            <span style={{ fontSize: 10, color: "#90a4c0", fontWeight: 500 }}>{isFR ? 'Durée' : 'Duration'}</span>
          </div>
          <div style={{ width: 1, height: 28, background: "#e0e8f4" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#08316e", lineHeight: 1 }}>
              {formatDistance(circuit.distance)}
              <span style={{ fontSize: 12, fontWeight: 500, color: "#5a6a85" }}> km</span>
            </span>
            <span style={{ fontSize: 10, color: "#90a4c0", fontWeight: 500 }}>Distance</span>
          </div>
        </div>

        {/* Bouton publier */}
        {onPublish && (
          <button
            onClick={(e) => { e.stopPropagation(); onPublish(circuit); }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: isActive ? "#08316e" : "#f0f4fb",
              color: isActive ? "#fff" : "#08316e",
              border: "none", borderRadius: 8,
              padding: "7px 12px",
              fontSize: 12, fontWeight: 700,
              cursor: "pointer", transition: "all 0.18s",
            }}
          >
            <FaCar size={11} />
            {isFR ? '+ Publier ce circuit' : '+ Publish this circuit'}
          </button>
        )}

        {/* Bouton choisir ce circuit — ouvre la page de création de trajet avec les coords pré-remplies */}
        {onChoose && (
          <button
            onClick={(e) => { e.stopPropagation(); onChoose(circuit); }}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              background: "#16a34a",
              color: "#fff",
              border: "none", borderRadius: 8,
              padding: "7px 12px",
              fontSize: 12, fontWeight: 700,
              cursor: "pointer", transition: "all 0.18s",
              marginTop: 4,
            }}
          >
            {isFR ? 'Choisir ce circuit' : 'Choose this circuit'}
          </button>
        )}
      </div>
    </div>
  );
}
