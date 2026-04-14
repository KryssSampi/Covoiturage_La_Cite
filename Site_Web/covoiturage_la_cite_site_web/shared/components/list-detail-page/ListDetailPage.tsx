"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiMousePointer } from "react-icons/fi";
import Image from "next/image";
import { useIsMobileOrTablet } from "@/shared/hooks/useismobileortable";
import { Language, useAppState } from "@/core/state/app_state";
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
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
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

  const handleCardClick = useCallback(
    (item: T, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();

      if (!withOverview) {
        onCardClick?.(item);
        return;
      }

      selectItem(item.id, e);
      if (isBelowLg) setMobileSheetOpen(true);
    },
    [withOverview, onCardClick, selectItem, isBelowLg],
  );

  const isEmpty   = !isLoading && items.length === 0;
  const noResults = !isLoading && items.length > 0 && filteredItems.length === 0;

  return (
    <div className="flex relative h-full w-full gap-3 overflow-hidden p-3 bg-white/90 min-h-screen max-h-[90vh]">
      <div className="absolute inset-0 w-full h-[60vh]">
        <Image src="/img/list-detail-background.png" alt="Background" fill className="object-cover object-center w-full h-[40vh]" />
        <div className="absolute inset-0 bg-linear-to-t from-blue-600/60 to-transparent" />
      </div>

      <div className="flex relative h-full w-full gap-3 overflow-hidden p-3 min-h-[90vh] max-h-[90vh]">

        {/* ── Colonne gauche : toolbar + liste ───────────────────────── */}
        <div
          className="flex flex-col gap-2 overflow-hidden shrink-0"
          style={{ width: withOverview && !isBelowLg ? 320 : "100%" }}
        >
          {/* Toolbar */}
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
                placeholder={isFR ? "Rechercher..." : "Search..."}
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

          <ActiveChipsBar
            chips={activeChips}
            onRemove={removeChip}
            onClearAll={clearAllFilters}
          />

          {!isLoading && (
            <p className="text-xs shrink-0 text-white">
              {filteredItems.length} {filteredItems.length === 1
                ? (isFR ? "élément" : "item")
                : (isFR ? "éléments" : "items")}
            </p>
          )}

          {/* Liste */}
          <div className="flex flex-col gap-2 overflow-y-auto flex-1 min-h-0 pr-0.5">

            {isLoading && Array.from({ length: skeletonCount }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}

            {isEmpty && (
              <EmptyState type="no-data" message={emptyMessage} emptyAction={emptyAction} />
            )}
            {noResults && (
              <EmptyState type="no-results" onClearFilters={clearAllFilters} />
            )}

            {/* Cartes — entrée échelonnée + sortie à la suppression */}
            <AnimatePresence>
              {!isLoading && filteredItems.map((item, index) => {
                const isSelected = item.id === selectedId;
                return (
                  <motion.div
                    key={item.id}
                    onClick={(e) => handleCardClick(item, e)}
                    className="shrink-0 cursor-pointer rounded-xl border-2"
                    /* ── Entrée échelonnée ── */
                    initial={{ opacity: 0, y: 10 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      borderColor: isSelected ? "#08316e" : "rgba(0,0,0,0)",
                      backgroundColor: isSelected ? "#e8eef7" : "#ffffff",
                    }}
                    exit={{ opacity: 0, y: -6, transition: { duration: 0.12 } }}
                    transition={{
                      duration: 0.2,
                      delay: Math.min(index * 0.035, 0.35),
                      ease: "easeOut",
                    }}
                    /* ── Hover ── */
                    whileHover={
                      !isSelected
                        ? {
                            scale: 1.012,
                            borderColor: "#c5d8f0",
                            backgroundColor: "#f4f8fd",
                            boxShadow: "0 4px 14px rgba(8,49,110,0.09)",
                          }
                        : { scale: 1.004 }
                    }
                    /* ── Click ── */
                    whileTap={{ scale: 0.976 }}
                    style={{
                      boxShadow: isSelected
                        ? "0 2px 8px rgba(8,49,110,0.13)"
                        : "0 1px 3px rgba(0,0,0,0.06)",
                    }}
                  >
                    {renderCard(item, isSelected)}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Colonne droite : overview (desktop) ────────────────────── */}
        {withOverview && !isBelowLg && (
          <div className="flex-1 min-w-0 overflow-hidden flex flex-col">
            <div
              className="flex-1 bg-white rounded-xl border overflow-y-auto flex flex-col min-h-0"
              style={{ borderColor: "#e5e7eb" }}
            >
              {isLoading && <DetailSkeleton />}

              {!isLoading && (
                <AnimatePresence mode="wait">
                  {!selectedItem ? (
                    /* ── État vide : icône flottante ── */
                    <motion.div
                      key="overview-empty"
                      className="flex-1 flex flex-col items-center justify-center gap-3 p-10 text-center"
                      initial={{ opacity: 0, scale: 0.94 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.94 }}
                      transition={{ duration: 0.2 }}
                    >
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <FiMousePointer size={36} style={{ color: "#08316e", opacity: 0.2 }} />
                      </motion.div>
                      <p className="text-xs" style={{ color: "#9ca3af" }}>
                        {isFR
                          ? <>Sélectionnez un élément<br />dans la liste pour voir les détails</>
                          : <>Select an item<br />from the list to see details</>}
                      </p>
                    </motion.div>
                  ) : (
                    /* ── Contenu : glisse depuis la droite à chaque sélection ── */
                    <motion.div
                      key={`overview-${selectedItem.id}`}
                      className="flex-1 flex flex-col min-h-0"
                      initial={{ opacity: 0, x: 18 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      {renderDetail?.(selectedItem)}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        )}

        {/* ── Mobile : bottom sheet ───────────────────────────────────── */}
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
