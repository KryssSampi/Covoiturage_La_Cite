'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface DraftTrip {
  id: string;
  userId?: string;
  type?: string;
  data: {
    departure?: { label?: string; fullAddress?: string };
    arrival?: { label?: string; fullAddress?: string };
    departureDate?: string;
    departureTime?: string;
    maxPassengers?: number;
    pricePerPassenger?: number;
    vehicleId?: string;
    tripType?: string;
    paymentMethod?: string;
  };
  createdAt: string;
  updatedAt: string;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-CA', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function DraftCard({
  draft,
  onDelete,
  onEdit,
  deleting,
}: {
  draft: DraftTrip;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  deleting: boolean;
}) {
  const dep = draft.data?.departure?.label ?? draft.data?.departure?.fullAddress ?? '—';
  const arr = draft.data?.arrival?.label ?? draft.data?.arrival?.fullAddress ?? '—';
  const date = draft.data?.departureDate ?? null;
  const time = draft.data?.departureTime ?? null;
  const price = draft.data?.pricePerPassenger;
  const seats = draft.data?.maxPassengers;

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3 hover:shadow-md transition-shadow">
      {/* Route */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
            <span className="truncate">{dep}</span>
            <span className="text-gray-400 flex-shrink-0">→</span>
            <span className="truncate">{arr}</span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            {date && <span>{new Date(date).toLocaleDateString('fr-CA', { weekday: 'short', month: 'short', day: 'numeric' })}</span>}
            {time && <span>{time}</span>}
            {seats && <span>{seats} place{seats > 1 ? 's' : ''}</span>}
            {price != null && <span>{price.toFixed(2)} $ / place</span>}
          </div>
        </div>
        <span className="flex-shrink-0 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100">
          Brouillon
        </span>
      </div>

      {/* Metadata */}
      <p className="text-xs text-gray-400">
        Modifié {formatDate(draft.updatedAt)}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-1 border-t border-gray-50">
        <button
          onClick={() => onEdit(draft.id)}
          className="flex-1 py-2 px-3 rounded-lg bg-[#08316e] text-white text-sm font-medium hover:bg-blue-800 transition-colors"
        >
          Continuer l'édition
        </button>
        <button
          onClick={() => onDelete(draft.id)}
          disabled={deleting}
          className="py-2 px-3 rounded-lg border border-red-200 text-red-600 text-sm hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          {deleting ? '…' : 'Supprimer'}
        </button>
      </div>
    </div>
  );
}

export default function BrouillonsPage({ userId }: { userId: string }) {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/drafts');
      if (!res.ok) throw new Error('Erreur chargement brouillons');
      const data = await res.json();
      const items: DraftTrip[] = Array.isArray(data) ? data : (data?.items ?? []);
      setDrafts(items);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDrafts(); }, [fetchDrafts]);

  const handleDelete = useCallback(async (id: string) => {
    if (confirmDelete !== id) {
      setConfirmDelete(id);
      return;
    }
    setDeletingId(id);
    setConfirmDelete(null);
    try {
      const res = await fetch(`/api/drafts/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Erreur suppression');
      setDrafts((prev) => prev.filter((d) => d.id !== id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur suppression');
    } finally {
      setDeletingId(null);
    }
  }, [confirmDelete]);

  const handleEdit = useCallback((id: string) => {
    router.push(`/driver/trajets/creer?draftId=${id}`);
  }, [router]);

  const handleCreateNew = useCallback(() => {
    router.push(`/driver/trajets/creer`);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm">Chargement des brouillons…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#08316e]">Brouillons</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {drafts.length} brouillon{drafts.length !== 1 ? 's' : ''} sauvegardé{drafts.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2 bg-[#08316e] text-white text-sm font-medium rounded-xl hover:bg-blue-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau trajet
        </button>
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <p className="text-red-600 text-sm">{error}</p>
          <button onClick={fetchDrafts} className="text-red-600 text-xs underline hover:no-underline">
            Réessayer
          </button>
        </div>
      )}

      {/* Confirmation suppression */}
      {confirmDelete && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-amber-800 text-sm font-medium">Confirmer la suppression ?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmDelete(null)}
              className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={() => handleDelete(confirmDelete)}
              className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Supprimer
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {drafts.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📝</div>
          <p className="font-medium text-gray-600 text-lg">Aucun brouillon</p>
          <p className="text-sm text-gray-400 mt-1 mb-6">
            Vos trajets en cours de création apparaîtront ici
          </p>
          <button
            onClick={handleCreateNew}
            className="px-6 py-2.5 bg-[#08316e] text-white rounded-xl hover:bg-blue-800 transition-colors text-sm font-medium"
          >
            Créer un trajet
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onDelete={handleDelete}
              onEdit={handleEdit}
              deleting={deletingId === draft.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
