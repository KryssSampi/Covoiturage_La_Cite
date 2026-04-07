/**
 * ProfileReviewsSection - Section Avis avec cartes de review
 * Anciennement dans [id]/page.tsx lignes 447-455
 */

"use client";

import Image from "next/image";
import Link from "next/link";
import { FaStar, FaStarHalf } from "react-icons/fa6";
import { Language } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";
import type { Review } from "@/features/dashboard/types";

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  return (
    <span className="text-yellow-500 flex text-2xl">
      {Array.from({ length: fullStars }, (_, i) => (
        <FaStar key={`full-${i}`} className="text-yellow-500" />
      ))}
      {hasHalf && (
        <div className="relative flex items-center">
          <FaStarHalf className="text-yellow-500 my-auto" />
          <FaStarHalf className="text-gray-300 rotate-y-180 absolute top-0 left-0" />
        </div>
      )}
      {Array.from({ length: emptyStars }, (_, i) => (
        <FaStar key={`empty-${i}`} className="text-gray-300" />
      ))}
    </span>
  );
}

function ReviewCard({ review, lang }: { review: Review; lang: Language }) {
  return (
    <div className="w-full mb-4 flex p-4 justify-between rounded-lg shadow-sm bg-gray-100">
      <div className="flex items-center">
        <Link href={`/public-profile/${review.reviewerId}`} className="flex items-center">
          <Image
            src={review.reviewerpicture || "/assets/placeholder/placeholer-profile-picture.png"}
            alt={`${review.reviewer} profile picture`}
            width={80}
            height={80}
            className="w-20 h-20 rounded-full mr-4 object-cover"
          />
        </Link>
        <div className="flex flex-col items-start">
          <div className="flex items-center">
            <Link href={`/public-profile/${review.reviewerId}`}>
              <h3 className="text-lg text-[#08316e] font-semibold hover:underline">
                {review.reviewer}
              </h3>
            </Link>
            <span className="ml-2 text-sm text-gray-500">
              {formatDate(review.date, lang)}
            </span>
          </div>
          <p className="text-gray-700 truncate">{review.comment}</p>
        </div>
      </div>
      <div className="flex items-center">
        <StarRating rating={review.rating} />
      </div>
    </div>
  );
}

interface ProfileReviewsSectionProps {
  reviewsLabel: string;
  reviews: Review[];
  lang: Language;
}

export function ProfileReviewsSection({ reviewsLabel, reviews, lang }: ProfileReviewsSectionProps) {
  return (
    <section className="bg-white p-5 rounded-lg shadow-sm">
      <h2 className="mb-3 text-lg font-bold">{reviewsLabel} ({reviews.length})</h2>
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} lang={lang} />
        ))}
      </div>
    </section>
  );
}
