'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAppState } from '@/core/state/app_state';

export interface Review {
  id: string;
  reviewer: string;
  reviewerId: string;
  revieweeId: string;
  reviewerpicture: string;
  rating: number;
  date: string;
  comment: string;
  tags: string[];
  tripId?: string | null;
  createdAt: string;
}

interface ReviewsPageProps {
  userId: string;
  role: 'driver' | 'passenger';
}

export default function ReviewsPage({ userId, role }: ReviewsPageProps) {
  const appState = useAppState();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/reviews/enriched?revieweeId=${userId}`);
      if (!res.ok) throw new Error('Erreur chargement avis');
      const data: Review[] = await res.json();
      setReviews(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { fetchReviews(); }, [fetchReviews]);

  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const filtered = filterRating
    ? reviews.filter((r) => Math.round(r.rating) === filterRating)
    : reviews;

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Math.round(r.rating) === star).length,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
          <p className="text-gray-500 text-sm">Chargement des avis…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 min-h-[300px]">
        <p className="text-red-500 font-medium">{error}</p>
        <button
          onClick={fetchReviews}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Header résumé */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-5xl font-bold text-[#08316e]">
              {averageRating.toFixed(1)}
            </span>
            <div className="flex gap-0.5 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xl ${star <= Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-200'}`}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500 mt-1">
              {reviews.length} avis
            </span>
          </div>
          <div className="flex-1 space-y-1">
            {distribution.map(({ star, count }) => (
              <button
                key={star}
                onClick={() => setFilterRating(filterRating === star ? null : star)}
                className={`w-full flex items-center gap-2 px-2 py-0.5 rounded-md transition-colors ${
                  filterRating === star ? 'bg-blue-50' : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-xs text-gray-500 w-4">{star}★</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{
                      width: reviews.length > 0 ? `${(count / reviews.length) * 100}%` : '0%',
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500 w-4 text-right">{count}</span>
              </button>
            ))}
          </div>
        </div>
        {filterRating && (
          <button
            onClick={() => setFilterRating(null)}
            className="mt-3 text-xs text-blue-600 hover:underline"
          >
            Effacer le filtre ({filterRating}★)
          </button>
        )}
      </div>

      {/* Liste des avis */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">⭐</div>
          <p className="font-medium text-gray-600">Aucun avis</p>
          <p className="text-sm mt-1">
            {filterRating
              ? `Aucun avis avec ${filterRating} étoile${filterRating > 1 ? 's' : ''}`
              : 'Vous n\'avez pas encore reçu d\'avis'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const date = new Date(review.createdAt);
  const formattedDate = date.toLocaleDateString('fr-CA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {review.reviewerpicture ? (
            <img
              src={review.reviewerpicture}
              alt={review.reviewer}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#08316e] flex items-center justify-center text-white font-semibold text-sm">
              {review.reviewer
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </div>
          )}
        </div>

        {/* Nom + date + étoiles */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm truncate">
              {review.reviewer}
            </span>
            <span className="text-xs text-gray-400">{formattedDate}</span>
          </div>
          <div className="flex gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={`text-sm ${star <= Math.round(review.rating) ? 'text-yellow-400' : 'text-gray-200'}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Commentaire */}
      {review.comment && (
        <p className="text-sm text-gray-700 leading-relaxed pl-13">
          {review.comment}
        </p>
      )}

      {/* Tags */}
      {review.tags && review.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pl-13">
          {review.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-100"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
