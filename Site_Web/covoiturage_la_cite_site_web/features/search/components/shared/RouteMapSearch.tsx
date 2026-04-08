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
 *   ┌────────────────────────────────────────────────────────────────────────┐
 *   │  Hero bleu-nuit + barre de recherche inline                             │
 *   ├──────────────────────────────┬─────────────────────────────────────────┤
 *   │  Filtres + Tri               │  Carte Leaflet                          │
 *   │  (collapsible)               │                                          │
 *   ├──────────────────────────────┴─────────────────────────────────────────┤
 *   │  Listing des résultats                                                │
 *   └────────────────────────────────────────────────────────────────────────┘
 */

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_SEARCH_FILTERS,
  DriverSortKey,
  MapCircuit,
  PassengerSortKey,
  SearchFilters,
  SearchRole,
  SortKey,
  TripWithCoords,
  getDRIVER_SORT_OPTIONS,
  getPASSENGER_SORT_OPTIONS,
} from "@/features/search/types/search.feature.types";
import { useRouteMap, RouteMapInitialValues } from "@/features/search/hooks/useRouteMap";
import { useDriverSearch } from "@/features/search/hooks/useDriverSearch";
import { usePassengerSearch } from "@/features/search/hooks/usePassengerSearch";
import { MapContainer } from "./route-map-search/MapContainer";
import { RouteControls } from "./route-map-search/RouteControls";
import { WaypointList } from "./route-map-search/WaypointList";
import { Trip } from "@/features/dashboard/types/trip.types";
import { Language, useAppState } from "@/core/state/app_state";
import type { PendingDateTime } from "@/features/planner/context/SearchBarContext";
import { fetchTripRoute } from "@/features/search/services/osrm.service";

export interface RouteMapSearchProps {
  role:             SearchRole;
  initialValues?:   RouteMapInitialValues;
  /** Trajets disponibles (passager) */
  availableTrips?:  Trip[];
  blockedTrips?:    TripWithCoords[];
  /** Carte tripId → statut de la réservation active du passager connecté */
  userReservations?: Map<string, string>;
  onPassengerSearch?: (params: {
    departureCoords: [number, number];
    arrivalCoords: [number, number];
    departureDate?: string;
    departureTime?: string;
    maxPrice?: number;
    minSeatsAvailable?: number;
    departureRadiusMeters?: number;
    arrivalRadiusMeters?: number;
  }) => Promise<void>;
  /** Callback pour rafraîchir la recherche passager avec les mêmes paramètres */
  onRefresh?: () => void;
  onPublishCircuit?: (circuit: MapCircuit) => void;
  /** Masque le hero + la barre de recherche (mode compact du planner) */
  hideSearchBar?:   boolean;
  /**
   * Variable de transition conducteur : date/heure choisie via TimeCell.
   * Sauvegardée en sessionStorage lors du choix de circuit pour pré-remplir
   * le formulaire de création de trajet.
   */
  pendingDateTime?: PendingDateTime | null;
}

export function RouteMapSearch({
  role,
  initialValues,
  availableTrips = [],
  blockedTrips = [],
  userReservations,
  onPassengerSearch,
  onPublishCircuit,
  onRefresh,
  hideSearchBar = false,
  pendingDateTime = null,
}: RouteMapSearchProps) {
  const router = useRouter();
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  const routeMap = useRouteMap(initialValues);

  const driverSearch = useDriverSearch({
    initialDepartureCoords: role === "driver" ? initialValues?.departureCoords : undefined,
    initialArrivalCoords: role === "driver" ? initialValues?.arrivalCoords : undefined,
    departureLabel: initialValues?.departureLabel ?? "Départ",
    arrivalLabel: initialValues?.arrivalLabel ?? "Arrivée",
  });

  const [filters, setFilters] = useState<SearchFilters>(DEFAULT_SEARCH_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>(role === "passenger" ? "matching_desc" : "default");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Réf pour ignorer le montage initial (filtres par défaut)
  const isFirstFilterRender = useRef(true);

  // Re-fetch côté serveur quand les filtres impactant le matching changent (debounce 500ms)
  useEffect(() => {
    if (isFirstFilterRender.current) {
      isFirstFilterRender.current = false;
      return;
    }
    if (role !== "passenger" || !onPassengerSearch) return;
    if (!routeMap.departureCoords || !routeMap.arrivalCoords) return;

    const timer = setTimeout(() => {
      onPassengerSearch({
        departureCoords: routeMap.departureCoords!,
        arrivalCoords: routeMap.arrivalCoords!,
        departureDate: routeMap.departureDate || undefined,
        departureTime: routeMap.departureTime || undefined,
        maxPrice: filters.maxPrice,
        minSeatsAvailable: filters.minSeatsAvailable,
        departureRadiusMeters: filters.departureRadiusMeters,
        arrivalRadiusMeters: filters.arrivalRadiusMeters,
      });
    }, 500);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.departureRadiusMeters, filters.arrivalRadiusMeters, filters.maxPrice, filters.minSeatsAvailable]);

  function updateFilter<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }
  function removeFilter(key: keyof SearchFilters) {
    setFilters((prev) => ({ ...prev, [key]: DEFAULT_SEARCH_FILTERS[key] }));
  }

  const desiredHour = routeMap.departureTime
    ? (() => { const [h, m] = routeMap.departureTime.split(":").map(Number); return h + m / 60; })()
    : undefined;

  // En mode passager, le serveur a déjà appliqué le filtre géographique.
  // On passe null pour éviter un double-filtrage client avec un rayon plus strict.
  const passengerCoordsForFilter = role === 'passenger' ? null : routeMap.departureCoords;
  const passengerArrivalForFilter = role === 'passenger' ? null : routeMap.arrivalCoords;

  const { filteredTrips, totalCount, scores } = usePassengerSearch({
    trips: availableTrips,
    departureCoords: passengerCoordsForFilter,
    arrivalCoords: passengerArrivalForFilter,
    filters,
    sortKey: sortKey as PassengerSortKey,
    desiredHour,
  });

  const [activeCircuitIdx, setActiveCircuitIdx] = useState(0);
  const sortedCircuits = driverSearch.filteredAndSortedCircuits(sortKey as DriverSortKey, filters);

  function handleChooseCircuit(circuit: MapCircuit) {
    const userId = appState.userConnected?.id ?? "me";
    if (typeof window !== "undefined") {
      sessionStorage.setItem("selectedCircuit", JSON.stringify(circuit));
      sessionStorage.setItem("createTripAccess", JSON.stringify({
        source: "tripway-search-selection",
        userId,
        createdAt: new Date().toISOString(),
      }));
      if (pendingDateTime) {
        sessionStorage.setItem("pendingTripDateTime", JSON.stringify(pendingDateTime));
      } else {
        sessionStorage.removeItem("pendingTripDateTime");
      }
    }
    let url = `/driver/create-trip/${userId}` +
      `?lieu_de_depart=${encodeURIComponent(circuit.departureLabel)}` +
      `&lieu_darrivee=${encodeURIComponent(circuit.arrivalLabel)}`;
    if (pendingDateTime) {
      url += `&departure_date=${encodeURIComponent(pendingDateTime.date)}`;
      url += `&departure_time=${encodeURIComponent(pendingDateTime.time)}`;
    }
    router.push(url);
  }

  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedTripRoute, setSelectedTripRoute] = useState<[number, number][]>([]);

  async function handleSelectTrip(trip: Trip) {
    if (selectedTripId === trip.id) {
      setSelectedTripId(null);
      setSelectedTripRoute([]);
      return;
    }

    setSelectedTripId(trip.id);

    const depC = trip.departureCoords;
    const arrC = trip.arrivalCoords;

    if (!depC || !arrC) {
      setSelectedTripRoute([]);
      return;
    }

    const [dLng, dLat] = depC;
    const [aLng, aLat] = arrC;
    const latLngs = await fetchTripRoute(dLng, dLat, aLng, aLat);
    setSelectedTripRoute(latLngs.length > 0 ? latLngs : (trip.latLngs ?? []));
  }

  async function handleSearch() {
    if (!routeMap.departureCoords || !routeMap.arrivalCoords) return;
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
      if (onPassengerSearch) {
        await onPassengerSearch({
          departureCoords: routeMap.departureCoords,
          arrivalCoords: routeMap.arrivalCoords,
          departureDate: routeMap.departureDate || undefined,
          departureTime: routeMap.departureTime || undefined,
          maxPrice: filters.maxPrice,
          minSeatsAvailable: filters.minSeatsAvailable,
          departureRadiusMeters: filters.departureRadiusMeters,
          arrivalRadiusMeters: filters.arrivalRadiusMeters,
        });
      }
      await routeMap.search();
    }
  }

  const isLoading = role === "driver" ? driverSearch.isLoading : routeMap.isLoading;
  const error = role === "driver" ? driverSearch.error : routeMap.error;

  const sortOptions = role === "passenger" ? getPASSENGER_SORT_OPTIONS(isFR) : getDRIVER_SORT_OPTIONS(isFR);

  const mapCircuits = role === "driver" ? sortedCircuits : [];
  const mapRoute = role === "passenger"
    ? (selectedTripRoute.length > 0 ? selectedTripRoute : routeMap.route?.latLngs ?? [])
    : [];

  const selectedTrip = selectedTripId != null
    ? (filteredTrips.find((t) => t.id === selectedTripId)
        ?? blockedTrips.find((t) => t.id === selectedTripId))
    : null;
  const mapDeparture = routeMap.departureCoords;
  const mapArrival = routeMap.arrivalCoords;
  const mapDepLabel = routeMap.departureValue;
  const mapArrLabel = routeMap.arrivalValue;
  const mapTripDeparture = selectedTrip?.departureCoords ?? null;
  const mapTripArrival = selectedTrip?.arrivalCoords ?? null;
  const mapTripDepLabel = selectedTrip?.departure ?? "";
  const mapTripArrLabel = selectedTrip?.destination ?? "";

  const departureRef = routeMap.departureRef;
  const departureValue = routeMap.departureValue;
  const departureSuggestions = routeMap.departureSuggestions;
  const onDepartureChange = routeMap.onDepartureChange;
  const onDepartureSelect = routeMap.onDepartureSelect;

  const arrivalRef = routeMap.arrivalRef;
  const arrivalValue = routeMap.arrivalValue;
  const arrivalSuggestions = routeMap.arrivalSuggestions;
  const onArrivalChange = routeMap.onArrivalChange;
  const onArrivalSelect = routeMap.onArrivalSelect;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: hideSearchBar ? "unset" : "90vh", background: "#f5f8ff", fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <RouteControls
        role={role}
        isFR={isFR}
        hideSearchBar={hideSearchBar}
        departureRef={departureRef}
        departureValue={departureValue}
        departureSuggestions={departureSuggestions}
        onDepartureChange={onDepartureChange}
        onDepartureSelect={onDepartureSelect}
        arrivalRef={arrivalRef}
        arrivalValue={arrivalValue}
        arrivalSuggestions={arrivalSuggestions}
        onArrivalChange={onArrivalChange}
        onArrivalSelect={onArrivalSelect}
        departureDate={routeMap.departureDate}
        setDepartureDate={routeMap.setDepartureDate}
        departureTime={routeMap.departureTime}
        setDepartureTime={routeMap.setDepartureTime}
        arrivalTime={routeMap.arrivalTime}
        setArrivalTime={routeMap.setArrivalTime}
        onSearch={handleSearch}
        isLoading={isLoading}
        error={error ?? null}
        filters={filters}
        setFilters={setFilters}
        updateFilter={updateFilter}
        removeFilter={removeFilter}
        filtersOpen={filtersOpen}
        setFiltersOpen={setFiltersOpen}
        sortOptions={sortOptions}
        sortKey={sortKey}
        onSortChange={setSortKey}
        filteredTripsCount={filteredTrips.length}
        totalCount={totalCount}
        circuitsCount={sortedCircuits.length}
        mapSlot={(
          <MapContainer
            role={role}
            isLoading={isLoading}
            isFR={isFR}
            mapDeparture={mapDeparture}
            mapArrival={mapArrival}
            mapDepLabel={mapDepLabel}
            mapArrLabel={mapArrLabel}
            mapTripDeparture={mapTripDeparture}
            mapTripArrival={mapTripArrival}
            mapTripDepLabel={mapTripDepLabel}
            mapTripArrLabel={mapTripArrLabel}
            mapRoute={mapRoute}
            mapCircuits={mapCircuits}
            activeCircuitIdx={activeCircuitIdx}
            filters={filters}
          />
        )}
      />

      <WaypointList
        role={role}
        isFR={isFR}
        filteredTrips={filteredTrips}
        totalCount={totalCount}
        sortedCircuits={sortedCircuits}
        blockedTrips={blockedTrips}
        activeCircuitIdx={activeCircuitIdx}
        isLoading={isLoading}
        scores={scores}
        selectedTripId={selectedTripId}
        onSelectTrip={handleSelectTrip}
        onSelectCircuit={setActiveCircuitIdx}
        onPublishCircuit={onPublishCircuit}
        onChooseCircuit={handleChooseCircuit}
        userReservations={userReservations}
        departureLabel={routeMap.departureValue}
        arrivalLabel={routeMap.arrivalValue}
        departureCoords={routeMap.departureCoords}
        arrivalCoords={routeMap.arrivalCoords}
        departureRadiusMeters={filters.departureRadiusMeters}
        arrivalRadiusMeters={filters.arrivalRadiusMeters}
        onRefresh={role === "passenger" ? onRefresh : undefined}
      />
    </div>
  );
}
