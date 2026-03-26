import type { IndisponibilityDateRange, IndisponibilityModel } from '@/core/models/IndisponibilityModel';
import { nowIso } from '@/core/utils/api-route.utils';
import { sortAndDeduplicateIndisponibilityDates } from '@/core/utils/indisponibility.utils';
import { persistenceManager } from '@/tests/PersistenceManager';

export function getOrCreateEmptyIndisponibility(id: string): IndisponibilityModel {
  const record = persistenceManager.readById<IndisponibilityModel>('indisponibilities', id);

  if (record) {
    return record;
  }

  const now = nowIso();
  return {
    id,
    dates: [],
    createdAt: now,
    updatedAt: now,
  };
}

export function saveIndisponibility(id: string, dates: IndisponibilityDateRange[]): { record: IndisponibilityModel; created: boolean } {
  const sanitizedDates = sortAndDeduplicateIndisponibilityDates(dates);
  const existing = persistenceManager.readById<IndisponibilityModel>('indisponibilities', id);

  if (existing) {
    const updated = persistenceManager.updateItem<IndisponibilityModel>('indisponibilities', id, {
      dates: sanitizedDates,
      updatedAt: nowIso(),
    });
    return { record: updated ?? existing, created: false };
  }

  const now = nowIso();
  const record: IndisponibilityModel = {
    id,
    dates: sanitizedDates,
    createdAt: now,
    updatedAt: now,
  };

  persistenceManager.addItem('indisponibilities', record);
  return { record, created: true };
}
