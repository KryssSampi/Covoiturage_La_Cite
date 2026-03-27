/* eslint-disable-file */
"use client";

import type { ReactNode, RefObject } from "react";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FaLocationDot, FaMagnifyingGlass, FaArrowRight, FaChevronDown, FaChevronUp, FaRotateLeft, FaClock, FaTriangleExclamation } from "react-icons/fa6";
import { FaSlidersH } from "react-icons/fa";
import { ActiveFiltersBar } from "../ActiveFiltersBar";
import {
  DEFAULT_SEARCH_FILTERS,
  SearchFilters,
  SearchRole,
  SortKey,
  SortOption,
} from "@/features/search/types/search.feature.types";
import type { LocationSuggestion } from "@/features/search/hooks/useRouteMap";

interface RouteControlsProps {
  role: SearchRole;
  isFR: boolean;
  hideSearchBar: boolean;
  departureRef: RefObject<HTMLInputElement | null>;
  departureValue: string;
  departureSuggestions: LocationSuggestion[];
  onDepartureChange: (value: string) => void;
  onDepartureSelect: (s: LocationSuggestion) => void;
  arrivalRef: RefObject<HTMLInputElement | null>;
  arrivalValue: string;
  arrivalSuggestions: LocationSuggestion[];
  onArrivalChange: (value: string) => void;
  onArrivalSelect: (s: LocationSuggestion) => void;
  departureDate: string;
  setDepartureDate: (value: string) => void;
  departureTime: string;
  setDepartureTime: (value: string) => void;
  arrivalTime: string;
  setArrivalTime: (value: string) => void;
  onSearch: () => void;
  isLoading: boolean;
  error: string | null;
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  updateFilter: (key: keyof SearchFilters, value: SearchFilters[keyof SearchFilters]) => void;
  removeFilter: (key: keyof SearchFilters) => void;
  filtersOpen: boolean;
  setFiltersOpen: (open: boolean) => void;
  sortOptions: SortOption<SortKey>[];
  sortKey: SortKey;
  onSortChange: (key: SortKey) => void;
  filteredTripsCount: number;
  totalCount: number;
  circuitsCount: number;
  mapSlot: ReactNode;
}

/**
 * Portal de suggestions — positionné en fixed via getBoundingClientRect.
 * Dépasse n'importe quel overflow:hidden, transform ou stacking context parent.
 */
function SuggestionDropdown({
  anchorRef,
  suggestions,
  onSelect,
}: {
  anchorRef: { readonly current: HTMLDivElement | null };
  suggestions: LocationSuggestion[];
  onSelect: (s: LocationSuggestion) => void;
}) {
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

  useLayoutEffect(() => {
    if (!suggestions.length || !anchorRef.current) return;
    const r = anchorRef.current.getBoundingClientRect();
    setCoords({ top: r.bottom + 4, left: r.left, width: r.width });
  }, [suggestions, anchorRef]);

  if (!suggestions.length || !coords || typeof document === "undefined") return null;

  return createPortal(
    <div style={{
      position: "fixed",
      top: coords.top,
      left: coords.left,
      width: coords.width,
      zIndex: 99999,
      background: "#fff",
      borderRadius: 10,
      border: "1.5px solid #d0d8e8",
      boxShadow: "0 8px 24px rgba(8,49,110,0.15)",
      overflow: "hidden",
    }}>
      {suggestions.map((s, i) => (
        <button key={i}
          onMouseDown={() => onSelect(s)}
          style={{
            width: "100%", textAlign: "left", padding: "10px 14px",
            background: "transparent", border: "none", cursor: "pointer",
            fontSize: 13, color: "#1a2a45",
            borderBottom: i < suggestions.length - 1 ? "1px solid #f0f4fb" : "none",
          }}
        >
          <span style={{ marginRight: 8, display: "inline-flex", alignItems: "center" }}>
            <FaLocationDot size={12} color="#08316e" />
          </span>
          {s.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}

export function RouteControls({
  role,
  isFR,
  hideSearchBar,
  departureRef,
  departureValue,
  departureSuggestions,
  onDepartureChange,
  onDepartureSelect,
  arrivalRef,
  arrivalValue,
  arrivalSuggestions,
  onArrivalChange,
  onArrivalSelect,
  departureDate,
  setDepartureDate,
  departureTime,
  setDepartureTime,
  arrivalTime,
  setArrivalTime,
  onSearch,
  isLoading,
  error,
  filters,
  setFilters,
  updateFilter,
  removeFilter,
  filtersOpen,
  setFiltersOpen,
  sortOptions,
  sortKey,
  onSortChange,
  filteredTripsCount,
  totalCount,
  circuitsCount,
  mapSlot,
}: RouteControlsProps) {
  const depContainerRef = useRef<HTMLDivElement>(null);
  const arrContainerRef = useRef<HTMLDivElement>(null);
  const activeFiltersCount = Object.keys(filters).filter((k) => {
    const key = k as keyof SearchFilters;
    if (key === "driverName") return !!filters[key];
    return filters[key] !== DEFAULT_SEARCH_FILTERS[key] && filters[key] !== undefined;
  }).length;

  return (
    <>
      {!hideSearchBar && (
        <div style={{
          background: "linear-gradient(135deg, #08316e 0%, #0a4a9e 60%, #1565c0 100%)",
          padding: "28px 20px 32px",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Fond décoratif */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.07, backgroundImage: "radial-gradient(circle at 70% 50%, #fff 0%, transparent 60%)" }} />

          <div style={{ position: "relative", width: "100%" }}>
            <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              {isFR ? <><span style={{ color: "#7eb8ff" }}>Recherche</span> de Trajet</> : <><span style={{ color: "#7eb8ff" }}>Trip</span> Search</>}
            </h1>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: "#a8c8f0", fontWeight: 500 }}>
              {role === "driver"
                ? (isFR ? "Trouve les meilleurs circuits de covoiturage à proposer" : "Find the best carpool circuits to offer")
                : (isFR ? "Trouve un trajet qui correspond à ton chemin" : "Find a trip that matches your route")}
            </p>

            {/* Barre de recherche */}
            <div style={{
              display: "flex", gap: 8, alignItems: "stretch",
              background: "rgba(255,255,255,0.1)",
              borderRadius: 14, padding: 8,
              backdropFilter: "blur(8px)",
              flexWrap: "wrap",
            }}>
              {/* Input départ */}
              <div ref={depContainerRef} style={{ flex: 1, minWidth: 160, position: "relative" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#fff", borderRadius: 10,
                  padding: "8px 12px",
                }}>
                  <FaLocationDot size={14} color="#08316e" />
                  <input
                    ref={departureRef}
                    value={departureValue}
                    onChange={(e) => onDepartureChange(e.target.value)}
                    placeholder={isFR ? "Départ…" : "Departure…"}
                    style={{
                      flex: 1, border: "none", outline: "none",
                      fontSize: 14, color: "#1a2a45", fontWeight: 600,
                      background: "transparent",
                    }}
                  />
                </div>
                <SuggestionDropdown anchorRef={depContainerRef} suggestions={departureSuggestions} onSelect={onDepartureSelect} />
              </div>

              <div style={{ display: "flex", alignItems: "center", color: "#fff", opacity: 0.6 }}>
                <FaArrowRight size={14} />
              </div>

              {/* Input arrivée */}
              <div ref={arrContainerRef} style={{ flex: 1, minWidth: 160, position: "relative" }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "#fff", borderRadius: 10,
                  padding: "8px 12px",
                }}>
                  <FaLocationDot size={14} color="#e04a2f" />
                  <input
                    ref={arrivalRef}
                    value={arrivalValue}
                    onChange={(e) => onArrivalChange(e.target.value)}
                    placeholder="Destination…"
                    style={{
                      flex: 1, border: "none", outline: "none",
                      fontSize: 14, color: "#1a2a45", fontWeight: 600,
                      background: "transparent",
                    }}
                  />
                </div>
                <SuggestionDropdown anchorRef={arrContainerRef} suggestions={arrivalSuggestions} onSelect={onArrivalSelect} />
              </div>

              {/* Sélection de la date/heure — masquée pour le conducteur */}
              {role !== "driver" && (
                <>
                  <div style={{ position: "relative", minWidth: 155 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "8px 12px" }}>
                      <FaClock size={13} color="#08316e" />
                      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#5a6a85" }}>{isFR ? "Date de départ" : "Departure date"}</span>
                        <input
                          type="date"
                          value={departureDate}
                          onChange={(e) => setDepartureDate(e.target.value)}
                          style={{ border: "none", outline: "none", fontSize: 13, color: "#1a2a45", fontWeight: 600, background: "transparent" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ position: "relative", minWidth: 130 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "8px 12px" }}>
                      <FaClock size={13} color="#08316e" />
                      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#5a6a85" }}>{isFR ? "Départ" : "Departure"}</span>
                        <input
                          type="time"
                          value={departureTime}
                          onChange={(e) => setDepartureTime(e.target.value)}
                          style={{ border: "none", outline: "none", fontSize: 13, color: "#1a2a45", fontWeight: 600, background: "transparent" }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ position: "relative", minWidth: 130 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "8px 12px" }}>
                      <FaClock size={13} color="#e04a2f" />
                      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        <span style={{ fontSize: 10, fontWeight: 600, color: "#5a6a85" }}>{isFR ? "Arrivée" : "Arrival"}</span>
                        <input
                          type="time"
                          value={arrivalTime}
                          onChange={(e) => setArrivalTime(e.target.value)}
                          style={{ border: "none", outline: "none", fontSize: 13, color: "#1a2a45", fontWeight: 600, background: "transparent" }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                onClick={onSearch}
                disabled={isLoading}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: isLoading ? "#90a4c0" : "#fff",
                  color: "#08316e",
                  border: "none", borderRadius: 10,
                  padding: "10px 20px",
                  fontSize: 14, fontWeight: 800,
                  cursor: isLoading ? "not-allowed" : "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s",
                }}
              >
                <FaMagnifyingGlass size={14} />
                {isLoading ? (isFR ? "Recherche…" : "Searching…") : (isFR ? "Rechercher" : "Search")}
              </button>
            </div>

            {error && (
              <div style={{ marginTop: 10, padding: "8px 14px", background: "rgba(224,74,47,0.15)", borderRadius: 8, fontSize: 12, color: "#ffb3a3", display: "flex", alignItems: "center", gap: 6 }}>
                <FaTriangleExclamation size={13} color="#ff9980" />
                {error}
              </div>
            )}
          </div>
        </div>
      )}

      <div style={{ width: "100%", padding: "16px 24px 40px" }}>
        <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{
              background: "#fff", border: "1.5px solid #d0d8e8",
              borderRadius: 14, overflow: "hidden",
              boxShadow: "0 1px 6px rgba(8,49,110,0.06)",
            }}>
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  justifyContent: "space-between", padding: "12px 16px",
                  background: "transparent", border: "none", cursor: "pointer",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#08316e" }}>
                  <FaSlidersH size={14} />
                  {isFR ? "Filtres" : "Filters"}
                  {activeFiltersCount > 0 && (
                    <span style={{
                      background: "#08316e", color: "#fff",
                      borderRadius: 20, fontSize: 10, fontWeight: 700,
                      padding: "1px 7px",
                    }}>
                      {activeFiltersCount}
                    </span>
                  )}
                </span>
                {filtersOpen ? <FaChevronUp size={12} color="#08316e" /> : <FaChevronDown size={12} color="#08316e" />}
              </button>

              <div style={{ maxHeight: filtersOpen ? 500 : 0, overflow: "hidden", transition: "max-height 0.35s ease" }}>
                <div style={{ padding: "0 16px 16px", display: "flex", flexDirection: "column", gap: 14 }}>
                  {role === "passenger" && (
                    <>
                      <FilterInput label={isFR ? "Nom du conducteur" : "Driver name"} value={filters.driverName ?? ""}
                        placeholder={isFR ? "Rechercher…" : "Search…"}
                        onChange={(v) => updateFilter("driverName", v || undefined)} />
                      <FilterRange label={isFR ? "Rayon départ" : "Departure radius"} value={filters.departureRadiusMeters} min={100} max={10000} step={100} unit="m"
                        onChange={(v) => updateFilter("departureRadiusMeters", v)} />
                      <FilterRange label={isFR ? "Rayon arrivée" : "Arrival radius"} value={filters.arrivalRadiusMeters} min={100} max={10000} step={100} unit="m"
                        onChange={(v) => updateFilter("arrivalRadiusMeters", v)} />
                      <FilterNumber label={isFR ? "Prix max. ($/pers.)" : "Max price ($/pers.)"} value={filters.maxPrice} min={1} max={200} placeholder={isFR ? "Pas de limite" : "No limit"}
                        onChange={(v) => updateFilter("maxPrice", v)} />
                      <FilterNumber label={isFR ? "Places min. dispo." : "Min seats avail."} value={filters.minSeatsAvailable} min={1} max={8} placeholder="1"
                        onChange={(v) => updateFilter("minSeatsAvailable", v)} />
                    </>
                  )}
                  {role === "driver" && (
                    <>
                      <FilterRange label={isFR ? "Durée max" : "Max duration"} value={filters.maxDurationMinutes ?? 120} min={10} max={300} step={10} unit="min"
                        onChange={(v) => updateFilter("maxDurationMinutes", v)} />
                      <FilterRange label={isFR ? "Distance max" : "Max distance"} value={(filters.maxDistanceKm ?? 100) * 1000} min={5000} max={300000} step={5000} unit="km"
                        display={(v) => (v / 1000).toFixed(0)} onChange={(v) => updateFilter("maxDistanceKm", v / 1000)} />
                    </>
                  )}
                  <button onClick={() => setFilters(DEFAULT_SEARCH_FILTERS)} style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    background: "transparent", border: "1.5px solid #d0d8e8", borderRadius: 8,
                    padding: "7px 0", fontSize: 12, color: "#5a6a85", cursor: "pointer", fontWeight: 600,
                  }}>
                    <FaRotateLeft size={10} /> {isFR ? "Réinitialiser" : "Reset"}
                  </button>
                </div>
              </div>
            </div>

            <ActiveFiltersBar filters={filters} onRemoveFilter={removeFilter} />

            {role === "passenger" && (
              <div style={{ fontSize: 12, color: "#5a6a85", textAlign: "center", padding: "4px 0" }}>
                {filteredTripsCount} {isFR ? `trajet${filteredTripsCount !== 1 ? "s" : ""} sur` : `trip${filteredTripsCount !== 1 ? "s" : ""} of`} {totalCount}
              </div>
            )}
            {role === "driver" && circuitsCount > 0 && (
              <div style={{ fontSize: 12, color: "#5a6a85", textAlign: "center", padding: "4px 0" }}>
                {circuitsCount} circuit{circuitsCount !== 1 ? "s" : ""} {isFR ? `trouvé${circuitsCount !== 1 ? "s" : ""}` : "found"}
              </div>
            )}
          </div>

          {mapSlot}

          <div style={{ background: "#fff", border: "1.5px solid #d0d8e8", borderRadius: 14, padding: "12px 16px", boxShadow: "0 1px 6px rgba(8,49,110,0.06)", minWidth: 260, marginTop: 16 }}>
            <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#5a6a85" }}>{isFR ? "Trier par :" : "Sort by:"}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {sortOptions.map((opt) => {
                const isActive = opt.key === sortKey;
                return (
                  <button key={opt.key} onClick={() => onSortChange(opt.key)}
                    style={{
                      textAlign: "left", padding: "7px 12px",
                      background: isActive ? "#08316e" : "#f0f4fb",
                      color: isActive ? "#fff" : "#1a2a45",
                      border: "none", borderRadius: 8,
                      fontSize: 12, fontWeight: isActive ? 700 : 500,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >{opt.label}</button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function FilterInput({
  label,
  value,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a2a45", marginBottom: 5 }}>{label}</label>
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", border: "1.5px solid #d0d8e8", borderRadius: 8, padding: "6px 10px", fontSize: 13, color: "#1a2a45", outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function FilterRange({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  display,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit: string;
  display?: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#1a2a45" }}>{label}</span>
        <span style={{ fontSize: 12, color: "#08316e", fontWeight: 700 }}>{display ? display(value) : value} {unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#08316e" }} />
    </div>
  );
}

function FilterNumber({
  label,
  value,
  min,
  max,
  placeholder,
  onChange,
}: {
  label: string;
  value?: number;
  min: number;
  max: number;
  placeholder: string;
  onChange: (v: number | undefined) => void;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a2a45", marginBottom: 5 }}>{label}</label>
      <input type="number" min={min} max={max} value={value ?? ""} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        style={{ width: "100%", border: "1.5px solid #d0d8e8", borderRadius: 8, padding: "6px 10px", fontSize: 13, color: "#1a2a45", outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}
