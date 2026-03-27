"use client";

/**
 * Page de listing des nouveautés (vidéos).
 * Composant pur : reçoit les items de la page route.
 * Supporte YouTube, Vimeo et tout lien vidéo direct.
 */

import { useCallback } from "react";
import Image from "next/image";

import { ListDetailPage } from "@/shared/components/list-detail-page";
import type { NouveauteModel } from "@/core/models/NouveauteModel";
import { useNouveautesConfig } from "../hooks/useNouveautesList";

// ─── Helpers vidéo ───────────────────────────────────────────────────────────

/** Extrait l'ID YouTube d'une URL (youtube.com, youtu.be). Retourne null sinon. */
function extractYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return m?.[1] ?? null;
}

/** Génère l'URL de miniature pour une vidéo (YouTube auto, sinon thumbnailUrl fourni) */
function getThumbnail(item: NouveauteModel): string {
  if (item.thumbnailUrl) return item.thumbnailUrl;
  const ytId = extractYouTubeId(item.videoUrl);
  if (ytId) return `https://img.youtube.com/vi/${ytId}/mqdefault.jpg`;
  return "/assets/placeholder/placeholer-profile-picture.png";
}

/** Génère l'URL d'embed pour le lecteur vidéo */
function getEmbedUrl(item: NouveauteModel): string | null {
  const ytId = extractYouTubeId(item.videoUrl);
  if (ytId) {
    return `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&loop=1&playlist=${ytId}&rel=0`;
  }
  // Vimeo
  const vimeoMatch = item.videoUrl.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&loop=1`;
  }
  return null;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface NouveautesPageProps {
  items: NouveauteModel[];
}

// ─── Carte de nouveauté pour le listing ──────────────────────────────────────

function NouveauteListCard({ item }: { item: NouveauteModel }) {
  return (
    <div className="flex items-center gap-3 p-3">
      <Image
        src={getThumbnail(item)}
        alt={item.title}
        className="w-24 h-14 rounded-lg object-cover shrink-0"
        width={120}
        height={68}
      />
      <span className="text-sm font-semibold text-black truncate flex-1">
        {item.title}
      </span>
    </div>
  );
}

// ─── Détail : lecteur vidéo ──────────────────────────────────────────────────

function NouveauteDetail({ item }: { item: NouveauteModel }) {
  const embedUrl = getEmbedUrl(item);

  return (
    <div className="flex flex-col h-full bg-black">
      {embedUrl ? (
        <iframe
          className="w-full flex-1 min-h-75"
          src={embedUrl}
          title={item.title}
          allow="autoplay; encrypted-media"
          allowFullScreen
          style={{ border: "none" }}
        />
      ) : (
        // Lien vidéo direct (mp4, etc.)
        <video
          className="w-full flex-1 min-h-75"
          src={item.videoUrl}
          controls
          autoPlay
          loop
        />
      )}
      <div className="bg-white p-4">
        <h3 className="text-sm font-bold text-[#08316e]">{item.title}</h3>
      </div>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export function NouveautesPage({ items }: NouveautesPageProps) {
  const { sortOptions, searchKeys, emptyMessage } = useNouveautesConfig();

  const renderCard = useCallback(
    (item: NouveauteModel) => <NouveauteListCard item={item} />,
    [],
  );

  const renderDetail = useCallback(
    (item: NouveauteModel) => <NouveauteDetail item={item} />,
    [],
  );

  return (
    <ListDetailPage
      items={items}
      renderCard={renderCard}
      renderDetail={renderDetail}
      sortOptions={sortOptions}
      searchKeys={searchKeys}
      withOverview={true}
      emptyMessage={emptyMessage}
      itemParamKey="nouveauteid"
    />
  );
}
