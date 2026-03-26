"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useSearchParams, usePathname } from "next/navigation";
import {
  buildActiveFilterChips,
  filterAndSortListDetailItems,
  resolveInitialSelectedId,
} from "@/core/utils/list-detail.utils";
import { FilterGroup, SortOption } from "../types";

interface UseListDetailProps<T extends { id: string | number }> {
  items: T[];
  filterGroups?: FilterGroup[];
  sortOptions?: SortOption[];
  searchKeys?: string[];
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
  const pathname = usePathname();

  const initialId = useMemo<string | number | null>(() => {
    if (!itemParamKey) return null;
    return resolveInitialSelectedId(searchParams.get(itemParamKey));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | number | null>(initialId);
  const [activeFilters, setActiveFilters] = useState<Record<string, Set<string>>>({});
  const [activeSortValue, setActiveSortValue] = useState<string>(sortOptions[0]?.value ?? "");
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [isSortOpen, setSortOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) setFilterOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (!itemParamKey) return;
    const newId = resolveInitialSelectedId(searchParams.get(itemParamKey));
    if (newId === null) return;
    if (newId !== selectedId) setSelectedId(newId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, itemParamKey]);

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

  const activeFilterCount = useMemo(
    () => Object.values(activeFilters).reduce((sum, set) => sum + set.size, 0),
    [activeFilters],
  );

  const activeChips = useMemo(
    () => buildActiveFilterChips(activeFilters, filterGroups),
    [activeFilters, filterGroups],
  );

  const filteredItems = useMemo(
    () =>
      filterAndSortListDetailItems({
        items,
        query,
        searchKeys,
        activeFilters,
        filterGroups,
        activeSortValue,
        sortOptions,
      }),
    [items, query, searchKeys, activeFilters, filterGroups, activeSortValue, sortOptions],
  );

  const selectedItem = useMemo(
    () => filteredItems.find((item) => item.id === selectedId) ?? null,
    [filteredItems, selectedId],
  );

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

  const removeChip = useCallback((field: string, value: string) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      const set = new Set(next[field] ?? []);
      set.delete(value);
      next[field] = set;
      return next;
    });
  }, []);

  const clearAllFilters = useCallback(() => {
    setActiveFilters({});
    setQuery("");
  }, []);

  const selectItem = useCallback((id: string | number, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSelectedId(id);
  }, []);

  const activeSortOption = sortOptions.find((sortOption) => sortOption.value === activeSortValue);

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
