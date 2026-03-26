import type { FilterGroup, SortOption } from '@/shared/components/list-detail-page';

export function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function matchesSearch<T>(item: T, query: string, searchKeys?: string[]): boolean {
  if (!query.trim()) return true;
  const normalizedQuery = query.toLowerCase();

  const values = searchKeys
    ? searchKeys.map((key) => getNestedValue(item, key))
    : Object.values(item as Record<string, unknown>);

  return values.some((value) => {
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(normalizedQuery);
  });
}

export function matchesFilters<T>(
  item: T,
  activeFilters: Record<string, Set<string>>,
  filterGroups: FilterGroup[],
): boolean {
  for (const group of filterGroups) {
    const active = activeFilters[group.field];
    if (!active || active.size === 0) continue;

    const value = String(getNestedValue(item, group.field) ?? '');
    if (!active.has(value)) return false;
  }

  return true;
}

export function buildActiveFilterChips(
  activeFilters: Record<string, Set<string>>,
  filterGroups: FilterGroup[],
): { field: string; value: string; label: string }[] {
  const chips: { field: string; value: string; label: string }[] = [];

  for (const group of filterGroups) {
    const active = activeFilters[group.field];
    if (!active) continue;

    for (const value of active) {
      const option = group.options.find((candidate) => candidate.value === value);
      if (option) chips.push({ field: group.field, value, label: option.label });
    }
  }

  return chips;
}

export function filterAndSortListDetailItems<T>({
  items,
  query,
  searchKeys,
  activeFilters,
  filterGroups,
  activeSortValue,
  sortOptions,
}: {
  items: T[];
  query: string;
  searchKeys?: string[];
  activeFilters: Record<string, Set<string>>;
  filterGroups: FilterGroup[];
  activeSortValue: string;
  sortOptions: SortOption[];
}): T[] {
  let result = items.filter(
    (item) => matchesSearch(item, query, searchKeys) && matchesFilters(item, activeFilters, filterGroups),
  );

  const sortFn = sortOptions.find((sortOption) => sortOption.value === activeSortValue)?.compareFn;
  if (sortFn) {
    result = [...result].sort(sortFn);
  }

  return result;
}

export function resolveInitialSelectedId(rawSelectedId: string | null): string | number | null {
  if (rawSelectedId === null) return null;
  const asNumber = Number(rawSelectedId);
  return Number.isNaN(asNumber) ? rawSelectedId : asNumber;
}
