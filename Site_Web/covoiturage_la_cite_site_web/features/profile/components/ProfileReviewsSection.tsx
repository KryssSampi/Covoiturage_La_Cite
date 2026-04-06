/**
 * Composant ProfileReviewsSection
 * Section avis réutilisant le composant Reviews existant
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { FaStar, FaStarHalf } from "react-icons/fa";
import type { PublicReview } from "../types/profile.types";

interface ProfileReviewsSectionProps {
  reviews: PublicReview[];
}

const AVATAR_FALLBACK = "/assets/placeholder/placeholer-profile-picture.png";

// Composant StarRating réutilisé
function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <span className="flex text-sm text-yellow-500">
      {Array.from({ length: fullStars }, (_, i) => (
        <FaStar key={`full-${i}`} className="text-yellow-500" />
      ))}
      {hasHalf && (
        <div className="relative flex items-center">
          <FaStarHalf className="text-yellow-500" />
          <FaStarHalf className="absolute left-0 top-0 rotate-y-180 text-gray-300" />
        </div>
      )}
      {Array.from({ length: emptyStars }, (_, i) => (
        <FaStar key={`empty-${i}`} className="text-gray-300" />
      ))}
    </span>
  );
}

// Carte d'avis individuelle
function ReviewCard({ review }: { review: PublicReview }) {
  const initials = review.reviewerName?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {review.reviewerAvatar ? (
            <Link href={`/profile/${review.reviewerId ?? "#"}`}>
              <Image
                src={review.reviewerAvatar}
                alt={review.reviewerName}
                width={32}
                height={32}
                className="rounded-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK;
                }}
              />
            </Link>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
              {initials}
            </div>
          )}
          <span className="text-sm font-medium">{review.reviewerName}</span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <StarRating rating={review.rating} />
          <span className="text-xs text-gray-400">
            {new Date(review.createdAt).toLocaleDateString("fr-CA", {
              month: "short",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
      {review.comment && (
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{review.comment}</p>
      )}
    </div>
  );
}

export function ProfileReviewsSection({ reviews }: ProfileReviewsSectionProps) {
  if (!reviews?.length) return null;

  return (
    <section className="mb-6">
      <h2 className="mb-3 text-lg font-bold">
        Avis ({reviews.length})
      </h2>
      <div className="flex flex-col gap-3">
        {reviews.map((review, index) => (
          <ReviewCard key={review.id ?? index} review={review} />
        ))}
      </div>
    </section>
  );
}
