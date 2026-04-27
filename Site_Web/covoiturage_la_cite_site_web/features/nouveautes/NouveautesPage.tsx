'use client';

import { useEffect, useState, useCallback, useRef } from 'react';

export interface Nouveaute {
  id: string;
  externalId: string;
  title: string;
  videoUrl: string;
  thumbnailUrl?: string;
  createdAt: string;
}

function getYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

function getEmbedUrl(url: string): string {
  const ytId = getYoutubeId(url);
  if (ytId) return `https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url;
}

function getThumbnail(item: Nouveaute): string | null {
  if (item.thumbnailUrl) return item.thumbnailUrl;
  const ytId = getYoutubeId(item.videoUrl);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
  return null;
}

function VideoModal({
  item,
  onClose,
}: {
  item: Nouveaute;
  onClose: () => void;
}) {
  const embedUrl = getEmbedUrl(item.videoUrl);
  const isNativeVideo =
    !getYoutubeId(item.videoUrl) && !item.videoUrl.includes('vimeo');

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-black rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 bg-white/20 hover:bg-white/40 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg transition-colors"
          aria-label="Fermer"
        >
          ×
        </button>
        <div className="aspect-video w-full">
          {isNativeVideo ? (
            <video
              src={item.videoUrl}
              controls
              autoPlay
              className="w-full h-full"
            />
          ) : (
            <iframe
              src={embedUrl}
              className="w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={item.title}
            />
          )}
        </div>
        <div className="bg-gray-900 px-4 py-3">
          <p className="text-white font-semibold text-sm">{item.title}</p>
          <p className="text-gray-400 text-xs mt-0.5">
            {new Date(item.createdAt).toLocaleDateString('fr-CA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>
    </div>
  );
}

function NouveauteCard({
  item,
  onPlay,
}: {
  item: Nouveaute;
  onPlay: (item: Nouveaute) => void;
}) {
  const thumb = getThumbnail(item);
  const date = new Date(item.createdAt).toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Miniature */}
      <button
        onClick={() => onPlay(item)}
        className="relative w-full aspect-video bg-gray-900 overflow-hidden block"
        aria-label={`Lire ${item.title}`}
      >
        {thumb ? (
          <img
            src={thumb}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#08316e] to-blue-500 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-white/40"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        )}
        {/* Bouton play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
            <svg
              className="w-6 h-6 text-[#08316e] ml-1"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      </button>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
          {item.title}
        </h3>
        <p className="text-xs text-gray-400 mt-1">{date}</p>
      </div>
    </div>
  );
}

export default function NouveautesPage() {
  const [items, setItems] = useState<Nouveaute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Nouveaute | null>(null);
  const [search, setSearch] = useState('');

  const fetchNouveautes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/nouveautes');
      if (!res.ok) throw new Error('Erreur chargement nouveautés');
      const data: Nouveaute[] = await res.json();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNouveautes();
  }, [fetchNouveautes]);

  const filtered = items.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm">Chargement des nouveautés…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={fetchNouveautes}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-[#08316e]">Nouveautés</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Découvrez les dernières mises à jour de la plateforme
          </p>
        </div>
        {items.length > 3 && (
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher…"
              className="pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-4">🎬</div>
          <p className="font-medium text-gray-600 text-lg">
            {search ? 'Aucun résultat' : 'Aucune nouveauté pour le moment'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-3 text-sm text-blue-600 hover:underline"
            >
              Effacer la recherche
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <NouveauteCard key={item.id} item={item} onPlay={setSelected} />
          ))}
        </div>
      )}

      {/* Modal vidéo */}
      {selected && (
        <VideoModal item={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
