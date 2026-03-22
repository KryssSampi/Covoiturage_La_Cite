/* eslint-disable-file */
"use client";

/**
 * @file RouteMapSearch.tsx  (v2)
 * @description Composant principal de la page Search.
 *
 * Deux modes :
 *   - Conducteur : barre de recherche → circuits OSRM → carte + listing MapCircuitCard
 *   - Passager   : barre de recherche → filtrage Haversine sur fixtures → carte + listing PassengerTripCard
 *
 * Layout (selon wireframe) :
 *   ┌─────────────────────────────────────────────────────────┐
 *   │  Hero bleu-nuit + barre de recherche inline             │
 *   ├──────────────────────┬──────────────────────────────────┤
 *   │  Filtres + Tri       │  Carte Leaflet                   │
 *   │  (collapsible)       │                                  │
 *   ├──────────────────────┴──────────────────────────────────┤
 *   │  Listing des résultats                                   │
 *   └─────────────────────────────────────────────────────────┘
 */

import dynamic              from "next/dynamic";
import { useRouter }        from "next/navigation";
import { useState, useRef, useLayoutEffect } from "react";
import { createPortal }     from "react-dom";
import { FaLocationDot, FaMagnifyingGlass, FaArrowRight, FaChevronDown, FaChevronUp, FaRotateLeft, FaClock, FaTriangleExclamation } from "react-icons/fa6";
import { FaSlidersH } from "react-icons/fa";  
import { SearchRole, SortKey, PassengerSortKey, DriverSortKey, SearchFilters, DEFAULT_SEARCH_FILTERS, getPASSENGER_SORT_OPTIONS, getDRIVER_SORT_OPTIONS, MapCircuit } from "@/features/search/types/search.feature.types";
import { useRouteMap, RouteMapInitialValues, LocationSuggestion } from "@/features/search/hooks/useRouteMap";
import { useDriverSearch }    from "@/features/search/hooks/useDriverSearch";
import { usePassengerSearch } from "@/features/search/hooks/usePassengerSearch";
import { ActiveFiltersBar }   from "./ActiveFiltersBar";
import { ListingZone }        from "./ListingZone";
import { Trip }               from "@/features/dashboard/types/trip.types";
import { useAppState }        from "@/core/state/app_state";
import { Language }            from "@/core/state/app_state";
import type { PendingDateTime } from "@/features/planner/context/SearchBarContext";

// URL de base OSRM — partagée avec useRouteMap
const OSRM_BASE = "https://router.project-osrm.org/route/v1/driving";

// MapView chargé en client-only (Leaflet)
const MapView = dynamic(() => import("./MapView").then((m) => m.MapView), { ssr: false });

export interface RouteMapSearchProps {
  role:             SearchRole;
  initialValues?:   RouteMapInitialValues;
  /** Trajets disponibles (passager) */
  availableTrips?:  Trip[];
  onPublishCircuit?: (circuit: MapCircuit) => void;
  onReserveTrip?:    (tripId: number) => void;
  /** Masque le hero + la barre de recherche (mode compact du planner) */
  hideSearchBar?:   boolean;
  /**
   * Variable de transition conducteur : date/heure choisie via TimeCell.
   * Sauvegardée en sessionStorage lors du choix de circuit pour pré-remplir
   * le formulaire de création de trajet.
   */
  pendingDateTime?: PendingDateTime | null;
}

// ─── Suggestion Dropdown ──────────────────────────────────────────────────────

/**
 * Portal de suggestions — positionné en fixed via getBoundingClientRect.
 * Dépasse n'importe quel overflow:hidden, transform ou stacking context parent.
 */
function SuggestionDropdown({
  anchorRef,
  suggestions,
  onSelect,
}: {
  anchorRef:   { readonly current: HTMLDivElement | null };
  suggestions: LocationSuggestion[];
  onSelect:    (s: LocationSuggestion) => void;
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
      top:      coords.top,
      left:     coords.left,
      width:    coords.width,
      zIndex:   99999,
      background:  "#fff",
      borderRadius: 10,
      border:      "1.5px solid #d0d8e8",
      boxShadow:   "0 8px 24px rgba(8,49,110,0.15)",
      overflow:    "hidden",
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
          <span style={{ marginRight: 8, display: 'inline-flex', alignItems: 'center' }}>
            <FaLocationDot size={12} color="#08316e" />
          </span>
          {s.label}
        </button>
      ))}
    </div>,
    document.body,
  );
}

// ─── RouteMapSearch ───────────────────────────────────────────────────────────

export function RouteMapSearch({
  role,
  initialValues,
  availableTrips  = [],
  onPublishCircuit,
  onReserveTrip,
  hideSearchBar   = false,
  pendingDateTime = null,
}: RouteMapSearchProps) {

  // ── Navigation + état utilisateur (pour la route vers create-trip) ────────
  const router   = useRouter();
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  // ── Route Map (inputs + OSRM single route pour passager) ─────────────────
  const routeMap = useRouteMap(initialValues);

  // ── Driver search ──────────────────────────────────────────────────────────
  const driverSearch = useDriverSearch({
    initialDepartureCoords: role === "driver" ? initialValues?.departureCoords : undefined,
    initialArrivalCoords:   role === "driver" ? initialValues?.arrivalCoords   : undefined,
    departureLabel:         initialValues?.departureLabel ?? "Départ",
    arrivalLabel:           initialValues?.arrivalLabel   ?? "Arrivée",
  });

  // ── Filters + Sort ─────────────────────────────────────────────────────────
  const [filters,   setFilters]   = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [sortKey,   setSortKey]   = useState<SortKey>(role === "passenger" ? "matching_desc" : "default");
  const [filtersOpen, setFiltersOpen] = useState(false);

  function updateFilter<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }
  function removeFilter(key: keyof SearchFilters) {
    setFilters((prev) => ({ ...prev, [key]: DEFAULT_SEARCH_FILTERS[key] }));
  }

  // ── Heure de départ → score horaire pour le matching passager ───────────────
  const desiredHour = routeMap.departureTime
    ? (() => { const [h, m] = routeMap.departureTime.split(":").map(Number); return h + m / 60; })()
    : undefined;

  // ── Passenger search ───────────────────────────────────────────────────────
  const { filteredTrips, totalCount, scores } = usePassengerSearch({
    trips:           availableTrips,
    departureCoords: routeMap.departureCoords,
    arrivalCoords:   routeMap.arrivalCoords,
    filters,
    sortKey:         sortKey as PassengerSortKey,
    desiredHour,
  });

  // ── Active circuit ─────────────────────────────────────────────────────────
  const [activeCircuitIdx, setActiveCircuitIdx] = useState(0);
  const sortedCircuits = driverSearch.filteredAndSortedCircuits(sortKey as DriverSortKey, filters);
  // ── Handler : le conducteur choisit un circuit → naviguer vers create-trip ──
  /**
   * Construit l'URL de création de trajet avec les coordonnées du circuit sélectionné.
   * Format : /driver/create-trip/[userId]?lieu_de_depart=lng,lat&lieu_darrivee=lng,lat
   */
  function handleChooseCircuit(circuit: MapCircuit) {
    const userId   = appState.userConnected?.id ?? 'me';
    // Sauvegarder le circuit complet en sessionStorage pour la polyline dans CreateTripForm
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('selectedCircuit', JSON.stringify(circuit));
      // Si une date/heure de départ a été sélectionnée via TimeCell (variable de transition),
      // on la sauvegarde également pour pré-remplir le formulaire de création
      if (pendingDateTime) {
        sessionStorage.setItem('pendingTripDateTime', JSON.stringify(pendingDateTime));
      } else {
        sessionStorage.removeItem('pendingTripDateTime');
      }
    }
    // Construire l'URL avec les noms de lieux + la date/heure si disponibles
    let url = `/driver/create-trip/${userId}` +
      `?lieu_de_depart=${encodeURIComponent(circuit.departureLabel)}` +
      `&lieu_darrivee=${encodeURIComponent(circuit.arrivalLabel)}`;
    if (pendingDateTime) {
      url += `&departure_date=${encodeURIComponent(pendingDateTime.date)}`;
      url += `&departure_time=${encodeURIComponent(pendingDateTime.time)}`;
    }
    router.push(url);
  }
  // ── Trajet passager sélectionné (clic sur une carte) ──────────────────────
  const [selectedTripId,    setSelectedTripId]    = useState<number | null>(null);
  const [selectedTripRoute, setSelectedTripRoute] = useState<[number, number][]>([]);

  /**
   * Selectionne un trajet passager et récupère sa polyline OSRM.
   * Appelé quand l'utilisateur clique sur une carte de résultat.
   */
  async function handleSelectTrip(trip: Trip) {
    // Si on re-clique sur le même trajet, on désélectionne
    if (selectedTripId === trip.id) {
      setSelectedTripId(null);
      setSelectedTripRoute([]);
      return;
    }

    setSelectedTripId(trip.id);

    const depC = trip.departureCoords;
    const arrC = trip.arrivalCoords;

    // Pas de coords sur ce trajet → pas de polyline
    if (!depC || !arrC) {
      setSelectedTripRoute([]);
      return;
    }

    try {
      const [dLng, dLat] = depC;
      const [aLng, aLat] = arrC;
      const url = `${OSRM_BASE}/${dLng},${dLat};${aLng},${aLat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`OSRM ${res.status}`);
      const data = await res.json();
      if (!data.routes?.length) throw new Error("Aucun itinéraire OSRM");
      // Conversion [lng, lat] OSRM → [lat, lng] Leaflet
      const latLngs: [number, number][] = data.routes[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng] as [number, number],
      );
      setSelectedTripRoute(latLngs);
    } catch {
      // Fallback : utiliser la polyline de la fixture si fournie, sinon route vide
      setSelectedTripRoute(trip.latLngs ?? []);
    }
  }

  // ── Search handler ─────────────────────────────────────────────────────────
  async function handleSearch() {
    if (!routeMap.departureCoords || !routeMap.arrivalCoords) return;
    // Nouvelle recherche → réinitialiser la sélection de trajet
    setSelectedTripId(null);
    setSelectedTripRoute([]);
    if (role === "driver") {
      await driverSearch.search(
        routeMap.departureCoords,
        routeMap.arrivalCoords,
        routeMap.departureValue,
        routeMap.arrivalValue,
      );
      setActiveCircuitIdx(0);
    } else {
      await routeMap.search();
    }
  }

  const isLoading = role === "driver" ? driverSearch.isLoading : routeMap.isLoading;
  const error     = role === "driver" ? driverSearch.error     : routeMap.error;

  const sortOptions = role === "passenger" ? getPASSENGER_SORT_OPTIONS(isFR) : getDRIVER_SORT_OPTIONS(isFR);

  // ── Circuits pour la carte ─────────────────────────────────────────────────
  const mapCircuits = role === "driver" ? sortedCircuits : [];
  // Priorité : polyline du trajet sélectionné > route de recherche générique
  const mapRoute    = role === "passenger"
    ? (selectedTripRoute.length > 0 ? selectedTripRoute : routeMap.route?.latLngs ?? [])
    : [];

  // Départ/arrivée de la RECHERCHE — toujours stables (marqueurs A/B + cercles bleus)
  const selectedTrip      = selectedTripId != null ? filteredTrips.find((t) => t.id === selectedTripId) : null;
  const mapDeparture      = routeMap.departureCoords; // toujours les coords de la recherche
  const mapArrival        = routeMap.arrivalCoords;   // toujours les coords de la recherche
  const mapDepLabel       = routeMap.departureValue;
  const mapArrLabel       = routeMap.arrivalValue;
  // Marqueurs spécifiques au trajet sélectionné (cercle vert + drapeau rouge)
  const mapTripDeparture  = selectedTrip?.departureCoords ?? null;
  const mapTripArrival    = selectedTrip?.arrivalCoords   ?? null;
  const mapTripDepLabel   = selectedTrip?.departure       ?? "";
  const mapTripArrLabel   = selectedTrip?.destination     ?? "";

  // ── Extraction des valeurs de routeMap pour éviter l'accès aux refs pendant le rendu ──
  const departureRef        = routeMap.departureRef;
  const departureValue      = routeMap.departureValue;
  const departureSuggestions = routeMap.departureSuggestions;
  const onDepartureChange   = routeMap.onDepartureChange;
  const onDepartureSelect   = routeMap.onDepartureSelect;

  const arrivalRef          = routeMap.arrivalRef;
  const arrivalValue        = routeMap.arrivalValue;
  const arrivalSuggestions  = routeMap.arrivalSuggestions;
  const onArrivalChange     = routeMap.onArrivalChange;
  const onArrivalSelect     = routeMap.onArrivalSelect;

  // Refs de container pour ancrer les portals de suggestions dans la searchbar
  const depContainerRef = useRef<HTMLDivElement>(null);
  const arrContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: hideSearchBar ? "unset" : "90vh", background: "#f5f8ff", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>

      {/* ── Hero (masqué en mode compact planner) ─────────────────────────────── */}
      {!hideSearchBar && <div style={{
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
              {/* Suggestions départ — portal ancré sur le container */}
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
              {/* Suggestions d'arrivée — portal ancré sur le container */}
              <SuggestionDropdown anchorRef={arrContainerRef} suggestions={arrivalSuggestions} onSelect={onArrivalSelect} />
            </div>

            {/* Sélection de la date et des heures — masqué pour le conducteur (sa recherche de circuits n'utilise pas la date/heure) */}
            {role !== "driver" && (
              <>
                {/* Date de départ */}
                <div style={{ position: "relative", minWidth: 155 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "8px 12px" }}>
                    <FaClock size={13} color="#08316e" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#5a6a85" }}>{isFR ? 'Date de départ' : 'Departure date'}</span>
                      <input
                        type="date"
                        value={routeMap.departureDate}
                        onChange={(e) => routeMap.setDepartureDate(e.target.value)}
                        style={{ border: "none", outline: "none", fontSize: 13, color: "#1a2a45", fontWeight: 600, background: "transparent" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Heure de départ */}
                <div style={{ position: "relative", minWidth: 130 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "8px 12px" }}>
                    <FaClock size={13} color="#08316e" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#5a6a85" }}>{isFR ? 'Départ' : 'Departure'}</span>
                      <input
                        type="time"
                        value={routeMap.departureTime}
                        onChange={(e) => routeMap.setDepartureTime(e.target.value)}
                        style={{ border: "none", outline: "none", fontSize: 13, color: "#1a2a45", fontWeight: 600, background: "transparent" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Heure d'arrivée */}
                <div style={{ position: "relative", minWidth: 130 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", borderRadius: 10, padding: "8px 12px" }}>
                    <FaClock size={13} color="#e04a2f" />
                    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: "#5a6a85" }}>{isFR ? 'Arrivée' : 'Arrival'}</span>
                      <input
                        type="time"
                        value={routeMap.arrivalTime}
                        onChange={(e) => routeMap.setArrivalTime(e.target.value)}
                        style={{ border: "none", outline: "none", fontSize: 13, color: "#1a2a45", fontWeight: 600, background: "transparent" }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Bouton Rechercher */}
            <button
              onClick={handleSearch}
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
      </div>}

      {/* ── Corps principal ────────────────────────────────────────────────────── */}
      <div style={{ width: "100%", padding: "16px 24px 40px" }}>

        {/* Layout 3 colonnes (filtres | carte | tri) */}
        <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* Colonne gauche : Filtres + Tri */}
          <div style={{ width: 260, flexShrink: 0, display: "flex", flexDirection: "column", gap: 10 }}>

            {/* Filtres collapsible */}
            <div style={{
              background: "#fff", border: "1.5px solid #d0d8e8",
              borderRadius: 14, overflow: "hidden",
              boxShadow: "0 1px 6px rgba(8,49,110,0.06)",
            }}>
              <button
                onClick={() => setFiltersOpen((o) => !o)}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  justifyContent: "space-between", padding: "12px 16px",
                  background: "transparent", border: "none", cursor: "pointer",
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, color: "#08316e" }}>
                  <FaSlidersH size={14} />
                  {isFR ? 'Filtres' : 'Filters'}
                  {/* compteur filtres actifs */}
                  {Object.keys(filters).filter((k) => {
                    const key = k as keyof SearchFilters;
                    if (key === "driverName") return !!filters[key];
                    return filters[key] !== DEFAULT_SEARCH_FILTERS[key] && filters[key] !== undefined;
                  }).length > 0 && (
                    <span style={{
                      background: "#08316e", color: "#fff",
                      borderRadius: 20, fontSize: 10, fontWeight: 700,
                      padding: "1px 7px",
                    }}>
                      {Object.keys(filters).filter((k) => {
                        const key = k as keyof SearchFilters;
                        if (key === "driverName") return !!filters[key];
                        return filters[key] !== DEFAULT_SEARCH_FILTERS[key] && filters[key] !== undefined;
                      }).length}
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
                    <FaRotateLeft size={10} /> {isFR ? 'Réinitialiser' : 'Reset'}
                  </button>
                </div>
              </div>
            </div>

            {/* Filtres actifs */}
            <ActiveFiltersBar filters={filters} onRemoveFilter={removeFilter} />

            {/* Compteur résultats */}
            {role === "passenger" && (
              <div style={{ fontSize: 12, color: "#5a6a85", textAlign: "center", padding: "4px 0" }}>
                {filteredTrips.length} {isFR ? `trajet${filteredTrips.length !== 1 ? "s" : ""} sur` : `trip${filteredTrips.length !== 1 ? "s" : ""} of`} {totalCount}
              </div>
            )}
            {role === "driver" && sortedCircuits.length > 0 && (
              <div style={{ fontSize: 12, color: "#5a6a85", textAlign: "center", padding: "4px 0" }}>
                {sortedCircuits.length} circuit{sortedCircuits.length !== 1 ? "s" : ""} {isFR ? `trouvé${sortedCircuits.length !== 1 ? "s" : ""}` : 'found'}
              </div>
            )}
          </div>

          {/* Colonne droite : Carte */}
          <div style={{ flex: 1, minWidth: 280 , maxHeight: "60vh", position: "relative"}}>
            <div style={{ borderRadius: 16, overflow: "hidden", border: "1.5px solid #d0d8e8", boxShadow: "0 2px 12px rgba(8,49,110,0.1)" }}>
              {/* A/B = coords de la recherche (stables, ne bougent pas). Trip = coords du trajet cliqué (vert/rouge) */}
              <MapView
                departure={mapDeparture ? [mapDeparture[1], mapDeparture[0]] : null}
                departureLabel={mapDepLabel}
                arrival={mapArrival ? [mapArrival[1], mapArrival[0]] : null}
                arrivalLabel={mapArrLabel}
                tripDeparture={mapTripDeparture ? [mapTripDeparture[1], mapTripDeparture[0]] : null}
                tripDepartureLabel={mapTripDepLabel}
                tripArrival={mapTripArrival ? [mapTripArrival[1], mapTripArrival[0]] : null}
                tripArrivalLabel={mapTripArrLabel}
                routeLatLngs={mapRoute}
                circuits={mapCircuits}
                activeCircuitIndex={activeCircuitIdx}
                showRadiusCircles={role === "passenger"}
                departureRadiusMeters={filters.departureRadiusMeters}
                arrivalRadiusMeters={filters.arrivalRadiusMeters}
                height="60vh"
              />
            </div>

            {/* Overlay de chargement — blur la carte pendant que les résultats sont en cours */}
            {isLoading && (
              <div style={{
                position: "absolute", inset: 0, zIndex: 20,
                borderRadius: 16,
                background: "rgba(245,248,255,0.6)",
                backdropFilter: "blur(6px)",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 12,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%",
                  border: "3.5px solid rgba(8,49,110,0.12)",
                  borderTop: "3.5px solid #08316e",
                  animation: "ms-search-spin .8s linear infinite",
                }} />
                <span style={{
                  fontSize: 13, fontWeight: 700, color: "#08316e",
                  fontFamily: "'Syne', sans-serif",
                }}>
                  {role === "driver" ? (isFR ? "Recherche de circuits…" : "Searching circuits…") : (isFR ? "Recherche de trajets…" : "Searching trips…")}
                </span>
                <style>{`@keyframes ms-search-spin { to { transform: rotate(360deg) } }`}</style>
              </div>
            )}
          </div>

              {/* Tri */}
            <div style={{ background: "#fff", border: "1.5px solid #d0d8e8", borderRadius: 14, padding: "12px 16px", boxShadow: "0 1px 6px rgba(8,49,110,0.06)" , minWidth: 260, marginTop: 16}}>
              <p style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "#5a6a85" }}>{isFR ? 'Trier par :' : 'Sort by:'}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {sortOptions.map((opt) => {
                  const isActive = opt.key === sortKey;
                  return (
                    <button key={opt.key} onClick={() => setSortKey(opt.key)}
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

        {/* ── Listing ─────────────────────────────────────────────────────────── */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1.5px solid #d0d8e8", padding: "20px 16px", boxShadow: "0 1px 6px rgba(8,49,110,0.06)", maxHeight: "40vh", display: "flex", flexDirection: "column"   }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: "#08316e" }}>
              {role === "passenger"
                ? (isFR ? `${filteredTrips.length} trajet${filteredTrips.length !== 1 ? "s" : ""} disponible${filteredTrips.length !== 1 ? "s" : ""}` : `${filteredTrips.length} available trip${filteredTrips.length !== 1 ? "s" : ""}`)
                : (isFR ? `${sortedCircuits.length} circuit${sortedCircuits.length !== 1 ? "s" : ""} trouvé${sortedCircuits.length !== 1 ? "s" : ""}` : `${sortedCircuits.length} circuit${sortedCircuits.length !== 1 ? "s" : ""} found`)}
            </h2>
          </div>
          {/* Zone de défilement de la liste de résultats */}
          <div style={{ maxHeight: "65vh", overflowY: "auto", paddingRight: 4 }}>
            <ListingZone
              role={role}
              trips={role === "passenger" ? filteredTrips : undefined}
              circuits={role === "driver" ? sortedCircuits : undefined}
              activeCircuitIdx={activeCircuitIdx}
              isLoading={isLoading}
              scores={scores}
              selectedTripId={selectedTripId}
              onSelectTrip={handleSelectTrip}
              onSelectCircuit={setActiveCircuitIdx}
              onPublishCircuit={onPublishCircuit}
              onChooseCircuit={handleChooseCircuit}
              onReserveTrip={onReserveTrip}
              departureLabel={routeMap.departureValue}
              arrivalLabel={routeMap.arrivalValue}
              departureCoords={routeMap.departureCoords}
              arrivalCoords={routeMap.arrivalCoords}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sous-composants filtres inline ──────────────────────────────────────────

function FilterInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a2a45", marginBottom: 5 }}>{label}</label>
      <input type="text" value={value} placeholder={isFR ? "Rechercher…" : "Search…"} onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", border: "1.5px solid #d0d8e8", borderRadius: 8, padding: "6px 10px", fontSize: 13, color: "#1a2a45", outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}

function FilterRange({ label, value, min, max, step = 1, unit, display, onChange }:
  { label: string; value: number; min: number; max: number; step?: number; unit: string; display?: (v: number) => string; onChange: (v: number) => void }) {
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

function FilterNumber({ label, value, min, max, placeholder, onChange }:
  { label: string; value?: number; min: number; max: number; placeholder: string; onChange: (v: number | undefined) => void }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#1a2a45", marginBottom: 5 }}>{label}</label>
      <input type="number" min={min} max={max} value={value ?? ""} placeholder={placeholder}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : undefined)}
        style={{ width: "100%", border: "1.5px solid #d0d8e8", borderRadius: 8, padding: "6px 10px", fontSize: 13, color: "#1a2a45", outline: "none", boxSizing: "border-box" }} />
    </div>
  );
}
