"use client";

/**
 * @file reviews.section.tsx
 * @description Section "Les Avis Sur Moi" du dashboard.
 *
 * Affiche les derniers avis reçus par l'utilisateur connecté.
 * Chaque avis montre : photo + lien profil évaluateur, date relative,
 * commentaire tronqué et note en étoiles (support demi-étoile).
 *
 * @uses Review — type depuis dashboard/types
 * @uses formatRelativeDate — utilitaire partagé depuis shared/utils
 * @uses FIXTURE_REVIEWS — données de test (à remplacer par API)
 *
 * @remarks
 * La fonction FormatDate a été déplacée dans shared/utils/date.utils.ts
 * sous le nom formatRelativeDate pour casser la dépendance croisée avec
 * notifications.section.tsx qui l'importait directement depuis ce fichier.
 */

import Link from "next/link";
import Image from "next/image";
import { FaExternalLinkAlt, FaStar, FaStarHalf } from "react-icons/fa";

import { useAppState, Language } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";

import { Review } from "../../types/review.types";

/** Avatar par défaut si la photo de l'évaluateur est introuvable */
const AVATAR_FALLBACK = "/assets/placeholder/placeholer-profile-picture.png";

// ─── Composant principal ─────────────────────────────────────────────────────

/**
 * ReviewsSection
 *
 * @param reviews Liste des avis reçus par l'utilisateur.
 *   Par défaut : données de test (FIXTURE_REVIEWS).
 *   TODO: Brancher sur GET /api/users/{userId}/reviews?limit=5&sort=date_desc
 */
export function ReviewsSection({ reviews }: { reviews: Review[] }) {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  return (
    <section className="w-full py-5 border rounded-lg shadow-md px-6 bg-white">
      {/* ─── En-tête ──────────────────────────────────────────────────── */}
      <div className="container flex justify-between mx-auto px-10">
        <h2 className="text-3xl text-black font-bold">
          {isFR ? "Les Avis Sur Moi" : "Reviews About Me"}
        </h2>
        <FaExternalLinkAlt className="text-2xl text-gray-400" />
      </div>

      <div className="container mx-auto flex flex-col items-start">
        <div className="w-full h-1 bg-[#08316e] rounded-full" />

        {reviews.length === 0 ? (
          /* ─── État vide ──────────────────────────────────────────────── */
          <div className="w-11/12 mx-auto flex flex-col justify-center items-center max-h-50 overflow-y-auto">
            <p className="text-gray-700 text-4xl m-10">
              {isFR ? "Aucun avis pour le moment." : "No reviews yet."}
            </p>
          </div>
        ) : (
          /* ─── Liste des avis ─────────────────────────────────────────── */
          <div className="w-11/12 mx-auto flex flex-col max-h-50 overflow-y-auto">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="w-full mb-4 flex p-4 border justify-between rounded-lg shadow-sm bg-gray-100"
              >
                {/* Partie gauche : photo + infos évaluateur + commentaire */}
                <div className="flex items-center mb-2">
                  <Link href={`/public-profile/${review.reviewerId}`} className="flex items-center">
                    <Image
                      src={review.reviewerpicture || AVATAR_FALLBACK}
                      alt={`${review.reviewer} profile picture`}
                      width={600}
                      height={600}
                      className="w-20 h-20 rounded-full mr-4 object-cover"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = AVATAR_FALLBACK; }}
                    />
                  </Link>
                  <div className="flex flex-col items-start mb-2">
                    <div className="flex items-center mb-2">
                      <Link href={`/public-profile/${review.reviewerId}`}>
                        <h3 className="text-lg text-[#08316e] font-semibold hover:underline">
                          {review.reviewer}
                        </h3>
                      </Link>
                      <span className="ml-2 text-sm text-gray-500">
                        {formatDate(review.date, appState.lang)}
                      </span>
                    </div>
                    <p className="text-gray-700 truncate">{review.comment}</p>
                  </div>
                </div>

                {/* Partie droite : étoiles (pleine / demi / vide) */}
                <div className="flex items-center mb-2">
                  <StarRating rating={review.rating} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="w-full h-1 bg-[#08316e] rounded-full" />
      </div>
    </section>
  );
}

// ─── Sous-composants ─────────────────────────────────────────────────────────

/**
 * Affiche une note sous forme d'étoiles avec support des demi-étoiles.
 * Toujours sur 5 étoiles (pleine + demi + vide).
 *
 * @param rating Valeur entre 0 et 5 (ex: 3.5 → 3 pleines + 1 demi + 1 vide)
 */
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
          {/* Demi-étoile grise miroir pour compléter la silhouette */}
          <FaStarHalf className="text-gray-300 rotate-y-180 absolute top-0 left-0" />
        </div>
      )}
      {Array.from({ length: emptyStars }, (_, i) => (
        <FaStar key={`empty-${i}`} className="text-gray-300" />
      ))}
    </span>
  );
}
