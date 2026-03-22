"use client";

/**
 * Page de listing des avis reçus par l'utilisateur.
 * Commun aux deux rôles. Utilise ListDetailPage avec le hook useReviewsList.
 * Carte basée sur le visuel de ReviewsSection du dashboard (StarRating inclus).
 */

import { useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaStar, FaStarHalf } from "react-icons/fa";

import { Language, useAppState } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";
import { ListDetailPage } from "@/shared/components/list-detail-page";
import type { Review } from "@/features/dashboard/types/review.types";
import { useReviewsList } from "../hooks/useReviewsList";

/** Avatar par défaut si la photo de l'évaluateur est introuvable */
const AVATAR_FALLBACK = "/assets/placeholder/placeholer-profile-picture.png";

// ─── Sous-composant étoiles (repris de reviews.section.tsx) ──────────────────

function StarRating({ rating }: { rating: number }) {
  const fullStars  = Math.floor(rating);
  const hasHalf    = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <span className="text-yellow-500 flex text-sm">
      {Array.from({ length: fullStars }, (_, i) => (
        <FaStar key={`full-${i}`} className="text-yellow-500" />
      ))}
      {hasHalf && (
        <div className="relative flex items-center">
          <FaStarHalf className="text-yellow-500" />
          <FaStarHalf className="text-gray-300 rotate-y-180 absolute top-0 left-0" />
        </div>
      )}
      {Array.from({ length: emptyStars }, (_, i) => (
        <FaStar key={`empty-${i}`} className="text-gray-300" />
      ))}
    </span>
  );
}

// ─── Carte d'avis pour le listing ────────────────────────────────────────────

function ReviewListCard({ review, lang }: { review: Review; lang: Language }) {
  return (
    <div className="flex items-center gap-3 p-3">
      {/* Photo évaluateur */}
      <Link
        href={`/public-profile/${review.reviewerid}`}
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={review.reviewerpicture || AVATAR_FALLBACK}
          alt={review.reviewer}
          className="w-24 h-24 rounded-full object-cover shrink-0"
          width={96}
          height={96}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK; }}
        />
      </Link>

      {/* Infos */}
      <div className="flex flex-col flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/public-profile/${review.reviewerid}`}
            className="text-[18px] font-semibold text-[#08316e] hover:underline truncate"
            onClick={(e) => e.stopPropagation()}
          >
            {review.reviewer}
          </Link>
          <span className="text-[15px] text-gray-500">
            {formatDate(review.date, lang)}
          </span>
        </div>
        <p className="text-[15px] text-gray-700 truncate mt-0.5">{review.comment}</p>
      </div>

      {/* Étoiles */}
      <StarRating rating={review.rating} />
    </div>
  );
}

// ─── Page principale ─────────────────────────────────────────────────────────

export function ReviewsPage() {
  const { lang } = useAppState();
  const { items, sortOptions, searchKeys, emptyMessage } = useReviewsList();

  const renderCard = useCallback(
    (review: Review) => <ReviewListCard review={review} lang={lang} />,
    [lang],
  );

  return (
    <ListDetailPage
      items={items}
      renderCard={renderCard}
      sortOptions={sortOptions}
      searchKeys={searchKeys}
      withOverview={false}
      emptyMessage={emptyMessage}
    />
  );
}
