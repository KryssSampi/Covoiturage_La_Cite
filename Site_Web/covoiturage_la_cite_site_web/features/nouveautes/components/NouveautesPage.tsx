"use client";

/**
 * Page de listing des nouveautés (vidéos YouTube).
 * Commun aux deux rôles. Utilise ListDetailPage avec le hook useNouveautesList.
 * Le panneau détail affiche un iframe YouTube avec lecture en boucle.
 */

import { useCallback } from "react";
import Image from "next/image";

import { ListDetailPage } from "@/shared/components/list-detail-page";
import { useNouveautesList, type NouveauteItem } from "../hooks/useNouveautesList";

// ─── Carte de nouveauté pour le listing ──────────────────────────────────────

function NouveauteListCard({ item }: { item: NouveauteItem }) {
  return (
    <div className="flex items-center gap-3 p-3">
      {/* Miniature YouTube */}
      <Image
        src={`https://img.youtube.com/vi/${item.youtubeId}/mqdefault.jpg`}
        alt={item.title}
        className="w-24 h-14 rounded-lg object-cover shrink-0"
        width={120}
        height={68}
      />

      {/* Titre */}
      <span className="text-sm font-semibold text-black truncate flex-1">
        {item.title}
      </span>
    </div>
  );
}

// ─── Détail : iframe YouTube en boucle ───────────────────────────────────────

function NouveauteDetail({ item }: { item: NouveauteItem }) {
  return (
    <div className="flex flex-col h-full bg-black">
      <iframe
        className="w-full flex-1 min-h-75"
        src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&loop=1&playlist=${item.youtubeId}&rel=0`}
        title={item.title}
        allow="autoplay; encrypted-media"
        allowFullScreen
        style={{ border: "none" }}
      />
      <div className="bg-white p-4">
        <h3 className="text-sm font-bold text-[#08316e]">{item.title}</h3>
      </div>
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export function NouveautesPage() {
  const { items, searchKeys, emptyMessage } = useNouveautesList();

  const renderCard = useCallback(
    (item: NouveauteItem) => <NouveauteListCard item={item} />,
    [],
  );

  const renderDetail = useCallback(
    (item: NouveauteItem) => <NouveauteDetail item={item} />,
    [],
  );

  return (
    <ListDetailPage
      items={items}
      renderCard={renderCard}
      renderDetail={renderDetail}
      searchKeys={searchKeys}
      withOverview={true}
      emptyMessage={emptyMessage}
      itemParamKey="nouveauteid"
    />
  );
}
