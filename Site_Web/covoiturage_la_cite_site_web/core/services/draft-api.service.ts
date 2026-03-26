import type { DraftTrip } from '@/features/brouillons/types';
import type { IndisponibilityModel } from '@/core/models/IndisponibilityModel';
import { isDraftBlockedByIndisponibility } from '@/core/utils/indisponibility.utils';
import { generatePrefixedId, nowIso, sortByDateDesc } from '@/core/utils/api-route.utils';
import { persistenceManager } from '@/tests/PersistenceManager';

export type DraftRecord = Record<string, unknown>;

export function queryDrafts(driverId?: string | null): DraftRecord[] {
  let drafts = persistenceManager.readAll<DraftRecord>('drafts');

  if (driverId) {
    const indisponibility = persistenceManager.readById<IndisponibilityModel>('indisponibilities', driverId);
    drafts = drafts
      .filter((draft) => draft.driverId === driverId)
      .filter((draft) => !isDraftBlockedByIndisponibility(draft as unknown as DraftTrip, indisponibility));
  }

  return sortByDateDesc(drafts, (draft) => draft.updatedAt as string | undefined);
}

export function saveDraft(payload: DraftRecord): { draft?: DraftRecord; created: boolean; error?: string; status?: number } {
  if (!payload.driverId) {
    return { created: false, error: 'driverId est requis', status: 400 };
  }

  if (payload.id) {
    const existing = persistenceManager.readById<DraftRecord>('drafts', payload.id as string);
    if (existing) {
      const updated = persistenceManager.updateItem<DraftRecord>('drafts', payload.id as string, {
        ...payload,
        updatedAt: nowIso(),
      });
      return { draft: updated ?? undefined, created: false };
    }
  }

  const now = nowIso();
  const draft: DraftRecord = {
    ...payload,
    id: payload.id ?? generatePrefixedId('DRF'),
    createdAt: now,
    updatedAt: now,
  };

  persistenceManager.addItem('drafts', draft);
  return { draft, created: true };
}

export function getDraftById(id: string): DraftRecord | null {
  return persistenceManager.readById<DraftRecord>('drafts', id);
}

export function patchDraft(id: string, patch: DraftRecord): DraftRecord | null {
  return persistenceManager.updateItem<DraftRecord>('drafts', id, {
    ...patch,
    updatedAt: nowIso(),
  });
}

export function deleteDraft(id: string): void {
  persistenceManager.deleteItem('drafts', id);
}
