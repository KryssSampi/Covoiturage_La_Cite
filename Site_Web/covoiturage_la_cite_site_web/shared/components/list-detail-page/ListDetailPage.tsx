"use client";

import React, { useState, useCallback } from "react";
import { FiSearch, FiMousePointer } from "react-icons/fi";
import Image from "next/image";
import { useIsMobileOrTablet } from "@/shared/hooks/useismobileortable";
import { ListDetailPageProps }       from "./types";
import { useListDetail }             from "./hooks/useListDetail";
import { FilterDropdown }            from "./components/FilterDropdown";
import { SortDropdown }              from "./components/SortDropdown";
import { ActiveChipsBar }            from "./components/ActiveChipsBar";
import { EmptyState }                from "./components/EmptyState";
import { MobileDetailSheet }         from "./components/MobileDetailSheet";
import { CardSkeleton, DetailSkeleton } from "./components/Skeletons";

/**
 * Composant generique master-detail de listing.
 * Aucune logique metier — tout le modele de donnees (items, filtres, tri, actions)
 * est prepare dans un hook dedie par page.
 */
export function ListDetailPage<T extends { id: string | number }>({
  items,
  renderCard,
  renderDetail,
  filterGroups = [],
  sortOptions = [],
  searchKeys,
  withOverview = true,
  onCardClick,
  emptyMessage,
  emptyAction,
  isLoading = false,
  skeletonCount = 4,
  itemParamKey,
}: ListDetailPageProps<T>) {
  const {
    query, setQuery,
    selectedId, selectedItem, selectItem,
    activeFilters, activeFilterCount, activeChips,
    activeSortValue, setActiveSortValue,
    filteredItems,
    toggleFilter, removeChip, clearAllFilters,
    isFilterOpen, setFilterOpen, filterRef,
    isSortOpen, setSortOpen, sortRef,
  } = useListDetail({ items, filterGroups, sortOptions, searchKeys, itemParamKey });

  const isBelowLg = useIsMobileOrTablet();
  const [isMobileSheetOpen, setMobileSheetOpen] = useState(false);

  // Gestion du clic sur une carte
  const handleCardClick = useCallback(
    (item: T, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (!withOverview) {
        onCardClick?.(item);
        return;
      }

      selectItem(item.id, e);
      // Ouvrir le mobile sheet uniquement sur mobile/tablette
      if (isBelowLg) {
        setMobileSheetOpen(true);
      }
    },
    [withOverview, onCardClick, selectItem, isBelowLg],
  );

  const isEmpty   = !isLoading && items.length === 0;
  const noResults = !isLoading && items.length > 0 && filteredItems.length === 0;

  // Layout racine : 2 colonnes fixes, hauteur 100%, pas de scroll global
  return (
    <div className="flex relative h-full w-full gap-3 overflow-hidden p-3 bg-white/90 min-h-screen max-h-[90vh] ">
<div className="absolute inset-0 w-full h-[60vh]">
  <Image src="/img/list-detail-background.png" alt="Background" fill className="object-cover object-center  w-full h-[40vh]" />
<div className="absolute inset-0 bg-linear-to-t from-blue-600/60 to-transparent" />
</div>

< div className="flex relative h-full w-full gap-3 overflow-hidden p-3 min-h-[90vh] max-h-[90vh] ">
      {/* Colonne gauche : toolbar + liste */}
      <div
        className="flex flex-col gap-2 overflow-hidden shrink-0"
        style={{ width: withOverview && !isBelowLg ? 320 : "100%" }}
      >
        {/* Toolbar : filtre, recherche, tri */}
        <div className="flex items-center gap-2 shrink-0">

          <FilterDropdown
            filterGroups={filterGroups}
            activeFilters={activeFilters}
            activeCount={activeFilterCount}
            isOpen={isFilterOpen}
            containerRef={filterRef}
            onToggle={() => { setFilterOpen((v) => !v); setSortOpen(false); }}
            onToggleFilter={toggleFilter}
          />

          <div className="relative flex-1 min-w-0">
            <FiSearch
              size={14}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "#9ca3af" }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher..."
              disabled={isLoading || isEmpty}
              className="w-full h-12 pl-8 text-black pr-3 rounded-lg border bg-white text-lg outline-none transition-colors disabled:opacity-40"
              style={{ borderColor: query ? "#08316e" : "#e5e7eb" }}
            />
          </div>

          <SortDropdown
            sortOptions={sortOptions}
            activeSortValue={activeSortValue}
            isOpen={isSortOpen}
            containerRef={sortRef}
            onToggle={() => { setSortOpen((v) => !v); setFilterOpen(false); }}
            onSelect={setActiveSortValue}
          />
        </div>

        {/* Chips des filtres actifs */}
        <ActiveChipsBar
          chips={activeChips}
          onRemove={removeChip}
          onClearAll={clearAllFilters}
        />

        {/* Compteur */}
        {!isLoading && (
          <p className="text-xs shrink-0 text-white" >
            {filteredItems.length} {filteredItems.length === 1 ? "element" : "elements"}
          </p>
        )}

        {/* Liste — seule zone scrollable dans cette colonne */}
        <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pr-0.5">

          {/* Skeletons de chargement */}
          {isLoading && Array.from({ length: skeletonCount }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}

          {/* Liste vide */}
          {isEmpty && (
            <EmptyState
              type="no-data"
              message={emptyMessage}
              emptyAction={emptyAction}
            />
          )}

          {/* Aucun resultat */}
          {noResults && (
            <EmptyState
              type="no-results"
              onClearFilters={clearAllFilters}
            />
          )}

          {/* Cartes */}
          {!isLoading && filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={(e) => handleCardClick(item, e)}
              className="shrink-0 cursor-pointer rounded-xl border-2 transition-all duration-100"
              style={{
                borderColor: item.id === selectedId ? "#08316e" : "transparent",
                backgroundColor: item.id === selectedId ? "#e8eef7" : "#ffffff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              }}
              onMouseEnter={(e) => {
                if (item.id !== selectedId)
                  (e.currentTarget as HTMLElement).style.borderColor = "#c5d8f0";
              }}
              onMouseLeave={(e) => {
                if (item.id !== selectedId)
                  (e.currentTarget as HTMLElement).style.borderColor = "transparent";
              }}
            >
              {renderCard(item, item.id === selectedId)}
            </div>
          ))}
        </div>
      </div>

      {/* Colonne droite : panneau detail (desktop) — masqué sur mobile et si withOverview=false */}
      {withOverview && !isBelowLg && (
        <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
          <div
            className="flex-1 bg-white rounded-xl border overflow-y-auto flex flex-col min-h-0"
            style={{ borderColor: "#e5e7eb" }}
          >
            {isLoading && <DetailSkeleton />}

            {!isLoading && !selectedItem && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 p-10 text-center">
                <FiMousePointer size={36} style={{ color: "#08316e", opacity: 0.2 }} />
                <p className="text-xs" style={{ color: "#9ca3af" }}>
                  Selectionnez un element<br />dans la liste pour voir les details
                </p>
              </div>
            )}

            {!isLoading && selectedItem && renderDetail?.(selectedItem)}
          </div>
        </div>
      )}

      {/* Mobile : bottom sheet (uniquement sur mobile/tablette) */}
      {withOverview && isBelowLg && selectedItem && (
        <MobileDetailSheet
          isOpen={isMobileSheetOpen}
          onClose={() => setMobileSheetOpen(false)}
        >
          {renderDetail?.(selectedItem)}
        </MobileDetailSheet>
      )}
    </div>
    </div>
  );
}
