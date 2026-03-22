"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import { FilterGroup, SortOption } from "../types";

// Récupère une valeur imbriquée via notation pointée ("driver.firstName")
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

// Recherche textuelle sur les clés spécifiées ou toutes les props string/number
function matchesSearch<T>(item: T, query: string, searchKeys?: string[]): boolean {
  if (!query.trim()) return true;
  const q = query.toLowerCase();

  const values = searchKeys
    ? searchKeys.map((k) => getNestedValue(item, k))
    : Object.values(item as Record<string, unknown>);

  return values.some((v) => {
    if (v === null || v === undefined) return false;
    return String(v).toLowerCase().includes(q);
  });
}

// Vérifie si un item passe tous les filtres actifs
function matchesFilters<T>(
  item: T,
  activeFilters: Record<string, Set<string>>,
  filterGroups: FilterGroup[],
): boolean {
  for (const group of filterGroups) {
    const active = activeFilters[group.field];
    if (!active || active.size === 0) continue;
    const val = String(getNestedValue(item, group.field) ?? "");
    if (!active.has(val)) return false;
  }
  return true;
}

interface UseListDetailProps<T extends { id: string | number }> {
  items: T[];
  filterGroups?: FilterGroup[];
  sortOptions?: SortOption[];
  searchKeys?: string[];
  /** Clé du paramètre URL reflétant l'item sélectionné */
  itemParamKey?: string;
}

export function useListDetail<T extends { id: string | number }>({
  items,
  filterGroups = [],
  sortOptions = [],
  searchKeys,
  itemParamKey,
}: UseListDetailProps<T>) {
  const searchParams = useSearchParams();
  const pathname     = usePathname();

  // Initialise la sélection depuis le paramètre URL si disponible
  const initialId = useMemo<string | number | null>(() => {
    if (!itemParamKey) return null;
    const raw = searchParams.get(itemParamKey);
    if (raw === null) return null;
    // Convertit en number si possible (pour matcher les ids numériques)
    const asNum = Number(raw);
    return Number.isNaN(asNum) ? raw : asNum;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // seulement au premier rendu

  const [query, setQuery]                   = useState("");
  const [selectedId, setSelectedId]         = useState<string | number | null>(initialId);
  const [activeFilters, setActiveFilters]   = useState<Record<string, Set<string>>>({});
  const [activeSortValue, setActiveSortValue] = useState<string>(sortOptions[0]?.value ?? "");
  const [isFilterOpen, setFilterOpen]       = useState(false);
  const [isSortOpen, setSortOpen]           = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef   = useRef<HTMLDivElement>(null);

  // Fermer les dropdowns au clic extérieur
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (sortRef.current   && !sortRef.current.contains(e.target as Node))   setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Synchronise la sélection depuis le paramètre URL lors de navigations externes
  useEffect(() => {
    if (!itemParamKey) return;
    const raw = searchParams.get(itemParamKey);
    if (raw === null) return;
    const asNum = Number(raw);
    const newId = Number.isNaN(asNum) ? raw : asNum;
    if (newId !== selectedId) setSelectedId(newId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, itemParamKey]);

  // Synchronise le paramètre URL avec l'id sélectionné
  useEffect(() => {
    if (!itemParamKey) return;
    const params = new URLSearchParams(searchParams.toString());
    if (selectedId !== null) {
      params.set(itemParamKey, String(selectedId));
    } else {
      params.delete(itemParamKey);
    }
    const qs = params.toString();
    const newUrl = qs ? `${pathname}?${qs}` : pathname;
    window.history.replaceState(null, "", newUrl);
  }, [selectedId, itemParamKey, pathname, searchParams]);

  // Nombre total de filtres actifs (pour le badge)
  const activeFilterCount = useMemo(
    () => Object.values(activeFilters).reduce((sum, s) => sum + s.size, 0),
    [activeFilters],
  );

  // Chips à afficher dans la barre de filtres actifs
  const activeChips = useMemo(() => {
    const chips: { field: string; value: string; label: string }[] = [];
    for (const group of filterGroups) {
      const active = activeFilters[group.field];
      if (!active) continue;
      for (const val of active) {
        const opt = group.options.find((o) => o.value === val);
        if (opt) chips.push({ field: group.field, value: val, label: opt.label });
      }
    }
    return chips;
  }, [activeFilters, filterGroups]);

  // Items filtrés puis triés
  const filteredItems = useMemo(() => {
    let result = items.filter(
      (item) =>
        matchesSearch(item, query, searchKeys) &&
        matchesFilters(item, activeFilters, filterGroups),
    );

    const sortFn = sortOptions.find((s) => s.value === activeSortValue)?.compareFn;
    if (sortFn) result = [...result].sort(sortFn);

    return result;
  }, [items, query, activeFilters, activeSortValue, filterGroups, sortOptions, searchKeys]);

  // Item actuellement sélectionné
  const selectedItem = useMemo(
    () => filteredItems.find((i) => i.id === selectedId) ?? null,
    [filteredItems, selectedId],
  );

  // Active ou désactive un filtre
  const toggleFilter = useCallback((field: string, value: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      const set = new Set(next[field] ?? []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      next[field] = set;
      return next;
    });
  }, []);

  // Supprime un chip de filtre
  const removeChip = useCallback((field: string, value: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      const set = new Set(next[field] ?? []);
      set.delete(value);
      next[field] = set;
      return next;
    });
  }, []);

  // Réinitialise filtres et recherche
  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
    setQuery("");
  }, []);

  // Sélectionne un item
  const selectItem = useCallback((id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(id);
  }, []);

  const activeSortOption = sortOptions.find((s) => s.value === activeSortValue);

  return {
    query, setQuery,
    selectedId, selectedItem, selectItem,
    activeFilters, activeFilterCount, activeChips,
    activeSortValue, setActiveSortValue, activeSortOption,
    filteredItems,
    toggleFilter, removeChip, clearAllFilters,
    isFilterOpen, setFilterOpen, filterRef,
    isSortOpen, setSortOpen, sortRef,
  };
}
