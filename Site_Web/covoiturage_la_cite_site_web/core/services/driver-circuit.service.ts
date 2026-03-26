import { MapCircuit, DriverSortKey, SearchFilters } from '@/features/search/types/search.feature.types';

export function filterAndSortCircuits(
  circuits: MapCircuit[],
  key: DriverSortKey,
  filters?: Pick<SearchFilters, 'maxDurationMinutes' | 'maxDistanceKm'>,
): MapCircuit[] {
  let filtered = [...circuits];

  if (filters?.maxDurationMinutes !== undefined) {
    const maxDurationMinutes = filters.maxDurationMinutes;
    filtered = filtered.filter((circuit) => circuit.duration / 60 <= maxDurationMinutes);
  }
  if (filters?.maxDistanceKm !== undefined) {
    const maxDistanceKm = filters.maxDistanceKm;
    filtered = filtered.filter((circuit) => circuit.distance / 1000 <= maxDistanceKm);
  }

  switch (key) {
    case 'distance_asc':
      return filtered.sort((left, right) => left.distance - right.distance);
    case 'duration_asc':
      return filtered.sort((left, right) => left.duration - right.duration);
    case 'default':
    default:
      return filtered.sort((left, right) => left.routeIndex - right.routeIndex);
  }
}
