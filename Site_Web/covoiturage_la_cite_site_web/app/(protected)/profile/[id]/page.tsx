"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  FaArrowRight,
  FaCheckCircle,
  FaHeart,
  FaLeaf,
  FaLocationDot,
  FaShield,
  FaStar,
  FaUserPlus,
} from "react-icons/fa6";
import { useAppState } from "@/core/state/app_state";
import { ProfileUsualTripCard } from "@/features/profile/components/ProfileUsualTripCard";
import { useProfileActions } from "@/features/profile/hooks/useProfileActions";
import {
  mockBadges,
  mockPublishedTrips,
  mockReviews,
  mockUsualTrips,
  mockUserPublic,
} from "@/features/profile/fixtures/profile.fixtures";
import type { PublicReview, PublicTrip, UsualTrip } from "@/features/profile/types/profile.types";

// ── Helpers ───────────────────────────────────────────────────────────────────

function schoolRoleLabel(role: string): string {
  const map: Record<string, string> = {
    etudiant: "Étudiant",
    professeur: "Professeur",
    membredupersonnel: "Membre du personnel",
    administrateur: "Administrateur",
  };
  return map[role?.toLowerCase()] ?? role;
}

// ── Composant StarRating ──────────────────────────────────────────────────────

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar
          key={s}
          size={14}
          className={s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}
        />
      ))}
    </span>
  );
}

// ── Composant Badge ───────────────────────────────────────────────────────────

function BadgeItem({ name, icon, color }: { name: string; icon: string; color: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${color} text-xl`}>
        {icon}
      </div>
      <span className="text-center text-xs font-medium text-gray-600">{name}</span>
    </div>
  );
}

// ── Composant Stat Card ───────────────────────────────────────────────────────

function StatCard({
  icon,
  iconBg,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string | number;
  subValue?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-bold text-gray-800">
          {value}
          {subValue && <span className="text-sm font-normal text-gray-500"> {subValue}</span>}
        </p>
      </div>
    </div>
  );
}

// ── Composant Review Card ─────────────────────────────────────────────────────

function ReviewCard({ review }: { review: PublicReview }) {
  const initials = review.reviewerName?.[0]?.toUpperCase() ?? "?";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-600">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{review.reviewerName}</p>
            <StarRating rating={review.rating} />
            {review.comment && (
              <p className="mt-1 text-sm text-gray-600">{review.comment}</p>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400">
          {new Date(review.createdAt).toLocaleDateString("fr-CA", {
            month: "short",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}

// ── Composant Usual Trip Card (maquette) ──────────────────────────────────────

function UsualTripCard({
  trip,
  index,
  onSubscribe,
}: {
  trip: UsualTrip;
  index: number;
  onSubscribe: (departure: string, arrival: string) => void;
}) {
  const frequencies = ["Quotidien", "Dimanche", "Hebdo (Ven)"];
  const prices = ["15€", "09h", "16€"];

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-2">
        {index === 1 ? (
          <FaLocationDot className="text-gray-400" size={14} />
        ) : (
          <FaArrowRight className="text-gray-400" size={12} />
        )}
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {trip.departureLabel} → {trip.arrivalLabel}
          </p>
          <p className="text-xs text-gray-500">{frequencies[index]}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-gray-800">{prices[index]}</span>
        <button
          onClick={() => onSubscribe(trip.departureLabel, trip.arrivalLabel)}
          className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-200"
        >
          S'abonner
        </button>
      </div>
    </div>
  );
}

// ── Composant Published Trip Card (maquette) ──────────────────────────────────

function PublishedTripCard({ trip }: { trip: PublicTrip }) {
  const { userConnected } = useAppState();
  const driverName = `${userConnected?.firstName ?? "Julien"} ${userConnected?.lastName ?? "Moreau"}`;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <FaArrowRight className="text-gray-400" size={16} />
        <div>
          <p className="text-sm font-semibold text-gray-800">
            {trip.departureLabel} → {trip.arrivalLabel}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(trip.departureDate).toLocaleDateString("fr-CA", {
              day: "numeric",
              month: "short",
            })}{" "}
            {trip.departureTime?.substring(0, 5)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-xs text-green-600">
          {trip.availableSeats} places dispo
        </span>
        <span className="text-sm font-bold text-gray-800">{trip.pricePerPassenger}€</span>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 overflow-hidden rounded-full bg-gray-200">
            <Image
              src="/assets/placeholder/placeholer-profile-picture.png"
              alt={driverName}
              width={32}
              height={32}
              className="object-cover"
            />
          </div>
          <div className="text-xs">
            <p className="font-medium text-gray-700">{driverName.split(" ")[0]}</p>
            <p className="text-gray-500">Véhicule</p>
          </div>
        </div>
        <button className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
          Réserver
        </button>
      </div>
    </div>
  );
}

// ── Page Principale ───────────────────────────────────────────────────────────

export default function PublicProfilePage() {
  const { userConnected } = useAppState();
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [likeCount, setLikeCount] = useState(mockUserPublic.likesCount);

  const isSelf = userConnected?.id === mockUserPublic.id;
  const profile = mockUserPublic;
  const dp = profile.driverProfile;
  const fullName = `${profile.firstName} ${profile.lastName}`;

  const handleLikeChange = (liked: boolean, count: number) => {
    setIsLiked(liked);
    setLikeCount(count);
  };

  const handleFavoriteChange = (favorite: boolean) => {
    setIsFavorite(favorite);
  };

  const { handleLike, handleFavorite, handleSubscribe, handleReserve } = useProfileActions({
    targetUserId: profile.id,
    isLiked,
    isFavorite,
    likeCount,
    onLikeChange: handleLikeChange,
    onFavoriteChange: handleFavoriteChange,
  });

  return (
    <main className="mx-auto max-w-4xl px-4 py-6 text-gray-800">
      {/* ── Titre ─────────────────────────────────────────────────────────── */}
      <h1 className="mb-4 text-xl font-bold text-gray-800">Profile Summary</h1>

      {/* ── Banner + Avatar ───────────────────────────────────────────────── */}
      <div className="relative mb-6 h-40 w-full overflow-hidden rounded-2xl">
        <Image
          src="/img/planifier-background.png"
          alt="Banner"
          fill
          className="object-cover"
        />
        <div className="absolute -bottom-12 left-6">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-lg">
            <Image
              src={profile.avatarUrl ?? "/assets/placeholder/placeholer-profile-picture.png"}
              alt={fullName}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* ── Infos principales ─────────────────────────────────────────────── */}
      <div className="mb-6 flex items-start justify-between">
        <div className="ml-28 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">{fullName}</h2>
            {profile.isProfileVerified && (
              <FaCheckCircle className="text-blue-500" size={18} />
            )}
          </div>
          <p className="text-sm text-gray-500">
            Go Score {dp?.averageRating.toFixed(1)} · {dp?.totalTripsAsDriver} trajets · Localisation: Paris, FR
          </p>
        </div>

        {/* Boutons Suivre / Favori */}
        {!isSelf && (
          <div className="flex gap-2">
            <button
              onClick={handleLike}
              className={`flex flex-col items-center rounded-lg px-4 py-2 ${
                isLiked ? "bg-rose-500 text-white" : "border border-rose-500 text-rose-500"
              }`}
            >
              <div className="flex items-center gap-1">
                <FaHeart size={14} />
                <span className="text-sm font-bold">{likeCount}</span>
              </div>
              <span className="text-xs">Favori</span>
            </button>
            <button
              onClick={handleFavorite}
              className={`flex flex-col items-center rounded-lg px-4 py-2 ${
                isFavorite ? "bg-blue-600 text-white" : "bg-blue-600 text-white"
              }`}
            >
              <FaUserPlus size={14} />
              <span className="text-xs">Abonnement</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Bio ───────────────────────────────────────────────────────────── */}
      {profile.bio && (
        <div className="mb-6">
          <p className="text-sm leading-relaxed text-gray-600">
            <span className="font-semibold">Bio:</span> {profile.bio}
          </p>
        </div>
      )}

      {/* ── Badges + Langues + Véhicule ───────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {/* Badges */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Badges</h3>
          <div className="flex gap-3">
            {mockBadges.map((badge) => (
              <BadgeItem key={badge.id} {...badge} />
            ))}
          </div>
        </div>

        {/* Langues */}
        <div>
          <h3 className="mb-2 text-sm font-semibold text-gray-700">Languages</h3>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 text-sm">
              🇫🇷 Français
            </span>
            <span className="flex items-center gap-1 text-sm">
              🇬🇧 Anglais
            </span>
          </div>
        </div>

        {/* Véhicule */}
        {dp?.vehiclePhotoUrl && (
          <div>
            <div className="relative h-24 w-full overflow-hidden rounded-xl bg-gray-100">
              <Image
                src={dp.vehiclePhotoUrl}
                alt="Véhicule"
                fill
                className="object-cover"
              />
            </div>
            <p className="mt-1 text-center text-xs text-gray-500">
              {dp.vehicleMake} {dp.vehicleModel} {dp.vehicleColor}, {dp.vehicleYear}
            </p>
          </div>
        )}
      </div>

      {/* ── Statistiques ──────────────────────────────────────────────────── */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">Statistique</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            icon={<FaLeaf className="text-green-500" />}
            iconBg="bg-green-50"
            label="Go Score"
            value={dp?.averageRating.toFixed(1)}
            subValue="/ 5 ⭐"
          />
          <StatCard
            icon={<FaLocationDot className="text-blue-500" />}
            iconBg="bg-blue-50"
            label="Nombre de Trajets"
            value={dp?.totalTripsAsDriver}
          />
          <StatCard
            icon={<FaStar className="text-purple-500" />}
            iconBg="bg-purple-50"
            label="Note Globale"
            value=""
            subValue="⭐⭐⭐⭐⭐ 4.8"
          />
          <StatCard
            icon={<FaLeaf className="text-green-500" />}
            iconBg="bg-green-50"
            label="Économie CO2"
            value={`${(dp?.co2SavedKg ?? 0 / 1000).toFixed(1)} T.`}
            subValue="CO₂ évitées"
          />
        </div>
      </section>

      {/* ── Avis + Trajets Récurrents ─────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Avis */}
        <section>
          <h2 className="mb-3 text-lg font-bold">Avis ({mockReviews.length})</h2>
          <div className="flex flex-col gap-3">
            {mockReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </section>

        {/* Trajets Récurrents */}
        <section>
          <h2 className="mb-3 text-lg font-bold">Trajets Récurrents ({mockUsualTrips.length})</h2>
          <div className="flex flex-col gap-2">
            {mockUsualTrips.map((trip, index) => (
              <UsualTripCard
                key={index}
                trip={trip}
                index={index}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        </section>
      </div>

      {/* ── Derniers Trajets Publiés ──────────────────────────────────────── */}
      <section className="mb-6">
        <h2 className="mb-3 text-lg font-bold">
          Derniers Trajets Publiés <span className="text-sm font-normal text-gray-500">(Filtrés par nombre de passagers)</span>
        </h2>
        <div className="flex flex-col gap-3">
          {mockPublishedTrips.map((trip) => (
            <PublishedTripCard key={trip.id} trip={trip} />
          ))}
        </div>
      </section>
    </main>
  );
}
