"use client";

/**
 * @file rides.area.tsx
 * @description Orchestrateur de la zone trajets du planificateur.
 *
 * Toute la logique est déléguée à useRideArea.
 * Les blocs visuels sont découpés en sous-composants indépendants :
 *   - RidesAreaHeader   → navigation par jour
 *   - RidesStatusLegend → légende de statuts / filtre rapide
 *   - RidesToolbar      → recherche, filtre statut, tri, compteur
 *   - RidesList         → cartes conducteur ou passager
 *   - RidesEmptyState   → état vide
 */

import { useState } from "react";
import { useRideArea }         from "@/features/planner/hooks/useRideArea";
import { RidesAreaHeader }     from "@/features/planner/components/shared/rides/RidesAreaHeader";
import { RidesStatusLegend }   from "@/features/planner/components/shared/rides/RidesStatusLegend";
import { RidesToolbar }        from "@/features/planner/components/shared/rides/RidesToolbar";
import { RidesList }           from "@/features/planner/components/shared/rides/RidesList";
import { RidesEmptyState }     from "@/features/planner/components/shared/rides/RidesEmptyState";

// ─── COMPOSANT PRINCIPAL ─────────────────────────────────────────────────────

/**
 * RideArea
 *
 * Orchestrateur léger : délègue toute la logique à useRideArea et assemble
 * les sous-composants indépendants.
 */
export function RideArea({ onRefresh }: { onRefresh?: () => Promise<void> }) {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const {
    isFr, isDriver, lang,
    showAll, setShowAll,
    currentDay, isToday, goPrevDay, goNextDay, goToday,
    filterStatus, setFilterStatus,
    sortBy, setSortBy,
    searchQuery, setSearchQuery,
    hasActiveFilter,
    rawDayRides, visibleRides, statusCounts,
    statusKeys, statusLabels,
    formatStatus, getStatusColor,
    onCancelTrip, onCancelReservation, onStartReservation, onStartTrip,
  } = useRideArea();

  async function handleRefresh() {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try { await onRefresh(); } finally { setIsRefreshing(false); }
  }

  return (
    <section className="w-full h-full bg-gray-50 flex flex-col overflow-hidden">

      {/* ── Navigation par jour ────────────────────────────────────────── */}
      <RidesAreaHeader
        isFr={isFr}
        lang={lang}
        currentDay={currentDay}
        isToday={isToday}
        showAll={showAll}
        onPrevDay={goPrevDay}
        onNextDay={goNextDay}
        onToday={goToday}
        onToggleShowAll={() => setShowAll(!showAll)}
        onRefresh={onRefresh ? handleRefresh : undefined}
        isRefreshing={isRefreshing}
      />

      {/* ── Légende de statuts (filtre rapide) ─────────────────────────── */}
      <RidesStatusLegend
        isFr={isFr}
        statusCounts={statusCounts}
        filterStatus={filterStatus}
        onFilterChange={setFilterStatus}
      />

      {/* ── Barre d'outils ─────────────────────────────────────────────── */}
      <RidesToolbar
        isFr={isFr}
        lang={lang}
        searchQuery={searchQuery}
        filterStatus={filterStatus}
        sortBy={sortBy}
        statusKeys={statusKeys}
        statusLabels={statusLabels}
        visibleCount={visibleRides.length}
        totalCount={rawDayRides.length}
        hasActiveFilter={hasActiveFilter}
        onSearchChange={setSearchQuery}
        onFilterChange={setFilterStatus}
        onSortChange={setSortBy}
      />

      {/* ── Liste des trajets ou état vide ──────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0 max-h-125">
        {visibleRides.length === 0 ? (
          <RidesEmptyState
            isFr={isFr}
            isFiltered={hasActiveFilter}
            onReset={() => { setFilterStatus("all"); setSearchQuery(""); }}
          />
        ) : (
          <RidesList
            isDriver={isDriver}
            visibleRides={visibleRides}
            formatStatus={formatStatus}
            getStatusColor={getStatusColor}
            onCancelTrip={onCancelTrip}
            onCancelReservation={onCancelReservation}
            onStartReservation={onStartReservation}
            onStartTrip={onStartTrip}
          />
        )}
      </div>
    </section>
  );
}
