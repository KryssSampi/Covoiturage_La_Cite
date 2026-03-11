"use client";

/**
 * @file FilterSection.tsx
 * @description Section de filtres rétractable et responsive.
 *
 * - Role passager  : rayon (départ + arrivée), prix max, places min, statut
 * - Role conducteur: distance max, durée max
 *
 * Les filtres sont transmis via le callback onFiltersChange.
 * Ils sont persistés dans le localStorage pour une utilisation ultérieure.
 */

import { useState, useEffect } from "react";
import { FaSlidersH } from "react-icons/fa";
import { FaChevronDown, FaChevronUp, FaRotateLeft } from "react-icons/fa6";
import {
  SearchFilters,
  DEFAULT_SEARCH_FILTERS,
  SearchRole,
} from "@/features/search/types/search.feature.types";

const STORAGE_KEY = "search_filters_v1";

interface FilterSectionProps {
  role:             SearchRole;
  onFiltersChange:  (filters: SearchFilters) => void;
}

function loadFilters(): SearchFilters {
  if (typeof window === "undefined") return DEFAULT_SEARCH_FILTERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_SEARCH_FILTERS, ...JSON.parse(raw) } : DEFAULT_SEARCH_FILTERS;
  } catch {
    return DEFAULT_SEARCH_FILTERS;
  }
}

function saveFilters(filters: SearchFilters) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
  } catch {
    /* silencieux */
  }
}

/**
 * FilterSection — panneau de filtres collapsible.
 */
export function FilterSection({ role, onFiltersChange }: FilterSectionProps) {
  const [isOpen,  setIsOpen]  = useState(false);
  const [filters, setFilters] = useState<SearchFilters>(loadFilters);

  useEffect(() => {
    saveFilters(filters);
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  function updateFilter<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function resetFilters() {
    setFilters(DEFAULT_SEARCH_FILTERS);
  }

  return (
    <div style={{
      background:   "#fff",
      border:       "1.5px solid #d0d8e8",
      borderRadius: 14,
      overflow:     "hidden",
      boxShadow:    "0 1px 6px rgba(8,49,110,0.06)",
    }}>
      {/* En-tête cliquable */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        style={{
          width:          "100%",
          display:        "flex",
          alignItems:     "center",
          justifyContent: "space-between",
          padding:        "12px 16px",
          background:     "transparent",
          border:         "none",
          cursor:         "pointer",
        }}
        aria-expanded={isOpen}
        aria-controls="filter-panel"
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#08316e" }}>
          <FaSlidersH size={14} />
          Filtres
        </span>
        {isOpen ? <FaChevronUp size={13} color="#08316e" /> : <FaChevronDown size={13} color="#08316e" />}
      </button>

      {/* Panneau animé */}
      <div
        id="filter-panel"
        style={{
          maxHeight:  isOpen ? 600 : 0,
          overflow:   "hidden",
          transition: "max-height 0.35s ease",
        }}
      >
        <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* --- Filtres PASSAGER --- */}
          {role === "passenger" && (
            <>
              {/* Filtre par nom du conducteur */}
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a2a45", marginBottom: 5 }}>
                  Nom du conducteur
                </label>
                <input
                  type="text"
                  value={filters.driverName ?? ""}
                  placeholder="ex : Marie, Dupont…"
                  onChange={(e) => updateFilter("driverName", e.target.value || undefined)}
                  style={{
                    width:        "100%",
                    border:       "1.5px solid #d0d8e8",
                    borderRadius: 8,
                    padding:      "6px 10px",
                    fontSize:     13,
                    color:        "#1a2a45",
                    outline:      "none",
                    boxSizing:    "border-box",
                  }}
                />
              </div>

              <FilterRange
                label="Rayon départ"
                value={filters.departureRadiusMeters}
                min={100}
                max={5000}
                step={100}
                unit="m"
                onChange={(v) => updateFilter("departureRadiusMeters", v)}
              />

              <FilterRange
                label="Rayon arrivée"
                value={filters.arrivalRadiusMeters}
                min={100}
                max={5000}
                step={100}
                unit="m"
                onChange={(v) => updateFilter("arrivalRadiusMeters", v)}
              />

              <FilterNumber
                label="Prix max. ($/pers.)"
                value={filters.maxPrice}
                min={1}
                max={200}
                placeholder="Pas de limite"
                onChange={(v) => updateFilter("maxPrice", v)}
              />

              <FilterNumber
                label="Places min. disponibles"
                value={filters.minSeatsAvailable}
                min={1}
                max={8}
                placeholder="1"
                onChange={(v) => updateFilter("minSeatsAvailable", v)}
              />
            </>
          )}

          {/* --- Filtres CONDUCTEUR --- */}
          {role === "driver" && (
            <>
              <FilterRange
                label="Durée max"
                value={filters.maxDurationMinutes ?? 120}
                min={10}
                max={300}
                step={10}
                unit="min"
                onChange={(v) => updateFilter("maxDurationMinutes", v)}
              />

              <FilterRange
                label="Distance max"
                value={(filters.maxDistanceKm ?? 100) * 1000}
                min={5000}
                max={300000}
                step={5000}
                unit="km"
                display={(v) => (v / 1000).toFixed(0)}
                onChange={(v) => updateFilter("maxDistanceKm", v / 1000)}
              />
            </>
          )}

          {/* Bouton réinitialiser */}
          <button
            onClick={resetFilters}
            style={{
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            6,
              background:     "transparent",
              border:         "1.5px solid #d0d8e8",
              borderRadius:   8,
              padding:        "7px 0",
              fontSize:       12,
              color:          "#5a6a85",
              cursor:         "pointer",
              fontWeight:     600,
            }}
          >
            <FaRotateLeft size={11} />
            Réinitialiser
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Sous-composants internes ---

interface FilterRangeProps {
  label:     string;
  value:     number;
  min:       number;
  max:       number;
  step?:     number;
  unit:      string;
  display?:  (v: number) => string;
  onChange:  (v: number) => void;
}

function FilterRange({ label, value, min, max, step = 1, unit, display, onChange }: FilterRangeProps) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#1a2a45" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#08316e", fontWeight: 700 }}>
          {display ? display(value) : value} {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#08316e" }}
      />
    </div>
  );
}

interface FilterNumberProps {
  label:       string;
  value?:      number;
  min:         number;
  max:         number;
  placeholder: string;
  onChange:    (v: number | undefined) => void;
}

function FilterNumber({ label, value, min, max, placeholder, onChange }: FilterNumberProps) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a2a45", marginBottom: 5 }}>
        {label}
      </label>
      <input
        type="number"
        min={min}
        max={max}
        value={value ?? ""}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        style={{
          width:        "100%",
          border:       "1.5px solid #d0d8e8",
          borderRadius: 8,
          padding:      "6px 10px",
          fontSize:     13,
          color:        "#1a2a45",
          outline:      "none",
          boxSizing:    "border-box",
        }}
      />
    </div>
  );
}
