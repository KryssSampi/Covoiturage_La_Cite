import type { LieuFavoriUnifie } from '@/shared/types/lieu-favori.types';
import { persistenceManager } from '@/tests/PersistenceManager';

export type LieuFavoriRecord = LieuFavoriUnifie & { userId: string };

export function queryLieuxFavoris(userId: string): LieuFavoriUnifie[] {
  const all = persistenceManager.readAll<LieuFavoriRecord>('lieux_favoris');

  return all
    .filter((favori) => favori.userId === userId)
    .sort((left, right) => {
      if (left.isAnchored && !right.isAnchored) return -1;
      if (!left.isAnchored && right.isAnchored) return 1;
      return 0;
    })
    .map(({ userId: _userId, ...rest }) => rest as LieuFavoriUnifie);
}

export function saveLieuFavori(payload: LieuFavoriRecord): LieuFavoriRecord {
  const all = persistenceManager.readAll<LieuFavoriRecord>('lieux_favoris');
  const record: LieuFavoriRecord = {
    ...payload,
    id: payload.id ?? `FAV-LOC-${Date.now()}`,
  };

  persistenceManager.writeAll('lieux_favoris', [...all, record]);
  return record;
}

export function deleteLieuFavori(id: string, userId: string): void {
  const all = persistenceManager.readAll<LieuFavoriRecord>('lieux_favoris');
  const filtered = all.filter((favori) => !(favori.id === id && favori.userId === userId && !favori.isAnchored));
  persistenceManager.writeAll('lieux_favoris', filtered);
}
