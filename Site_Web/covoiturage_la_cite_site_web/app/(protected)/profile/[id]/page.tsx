"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaStar,
  FaHeart,
  FaUserPlus,
  FaUserCheck,
  FaArrowRight,
  FaLeaf,
  FaLocationDot,
} from "react-icons/fa6";
import {FaShield} from "react-icons/fa6";  
import { useAppState } from "@/core/state/app_state";
import { ProfileUsualTripCard } from "@/features/profile/components/ProfileUsualTripCard";
import { useLoader } from "@/core/context/loader.context";

// ── Types alignés sur UserPublicDto Server Core ───────────────────────────────

interface DriverProfilePublic {
  validationStatus: string;
  averageRating: number;
  totalTripsAsDriver: number;
  co2SavedKg: number;
  vehiclePhotoUrl?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: number;
  vehicleColor?: string;
}

interface PublicReview {
  reviewerName: string;
  reviewerAvatar?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

interface PublicTrip {
  id: string;
  departureLabel: string;
  arrivalLabel: string;
  departureDate: string;
  departureTime: string;
  availableSeats: number;
  pricePerPassenger: number;
}

interface UsualTrip {
  departureLabel: string;
  arrivalLabel: string;
}

interface UserPublic {
  id: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  isProfileVerified: boolean;
  canBeDriver: boolean;
  schoolRole: string;
  role: string;
  goScore: number;
  languagesSpoken: string[];
  createdAt: string;
  likesCount: number;
  isLikedByMe: boolean;
  isFavorite: boolean;
  driverProfile?: DriverProfilePublic;
  recentReviews: PublicReview[];
  recentPublishedTrips: PublicTrip[];
  usualTrips: UsualTrip[];
}

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

function roleLabel(role: string): string {
  const map: Record<string, string> = {
    driver: "Conducteur",
    passenger: "Passager",
    admin: "Administrateur",
  };
  return map[role?.toLowerCase()] ?? role;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <FaStar
          key={s}
          size={12}
          className={s <= Math.round(rating) ? "text-amber-400" : "text-gray-200"}
        />
      ))}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { userConnected } = useAppState();
  const { setActiveLoader } = useLoader();

  const [profile, setProfile] = useState<UserPublic | null>(null);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [error, setError] = useState(false);

  // Redirection si l'utilisateur consulte son propre profil
  const isSelf = userConnected?.id === id;

  useEffect(() => {
    if (!id) return;
    setActiveLoader(true);
    fetch(`/api/users/${id}/public`)
      .then((r) => r.json())
      .then((data: UserPublic) => {
        setProfile(data);
        setLikeCount(data.likesCount ?? 0);
        setIsLiked(data.isLikedByMe ?? false);
        setIsFavorite(data.isFavorite ?? false);
      })
      .catch(() => setError(true))
      .finally(() => setActiveLoader(false));
  }, [id, setActiveLoader]);

  // Like — optimiste
  const handleLike = useCallback(async () => {
    if (isSelf) return;
    const next = !isLiked;
    setIsLiked(next);
    setLikeCount((c) => (next ? c + 1 : Math.max(0, c - 1)));
    await fetch(`/api/users/${id}/like`, { method: "POST" }).catch(() => {
      // rollback si erreur réseau
      setIsLiked(!next);
      setLikeCount((c) => (!next ? c + 1 : Math.max(0, c - 1)));
    });
  }, [id, isLiked, isSelf]);

  // Ajouter aux favoris (Affinity toggle)
  const handleFavorite = useCallback(async () => {
    if (isSelf) return;
    const next = !isFavorite;
    setIsFavorite(next);
    await fetch(`/api/favoris/user-favori`, {
      method: next ? "POST" : "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId: id }),
    }).catch(() => setIsFavorite(!next));
  }, [id, isFavorite, isSelf]);

  // S'abonner à un trajet récurrent
  const handleSubscribe = useCallback(
    async (departure: string, arrival: string) => {
      if (!profile) return;
      await fetch(`/api/users/${id}/survey-alert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          driverId: id,
          driverName: `${profile.firstName} ${profile.lastName}`,
          departureLabel: departure,
          arrivalLabel: arrival,
        }),
      });
    },
    [id, profile]
  );

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-gray-500">
        <p className="text-lg font-medium">Profil introuvable</p>
        <button onClick={() => router.back()} className="text-sm text-blue-600 underline">
          Retour
        </button>
      </div>
    );
  }

  if (!profile) return null;

  const isDriver = profile.canBeDriver && profile.driverProfile;
  const dp = profile.driverProfile;
  const fullName = `${profile.firstName} ${profile.lastName}`;

  return (
    <main className="mx-auto max-w-2xl px-4 py-6 text-gray-800">
      {/* ── Banner + Avatar ──────────────────────────────────────────────── */}
      <div className="relative mb-16 h-36 w-full overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800">
        <div className="absolute -bottom-10 left-5">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-gray-200 shadow-md">
            {profile.avatarUrl ? (
              <Image src={profile.avatarUrl} alt={fullName} fill className="object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-blue-600">
                {profile.firstName[0]}
              </span>
            )}
          </div>
        </div>

        {/* Boutons action en haut à droite */}
        {!isSelf && (
          <div className="absolute right-3 top-3 flex gap-2">
            <button
              onClick={handleFavorite}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow transition-all ${
                isFavorite
                  ? "bg-blue-900 text-white"
                  : "bg-white/90 text-gray-700 hover:bg-blue-50"
              }`}
            >
              {isFavorite ? <FaUserCheck size={12} /> : <FaUserPlus size={12} />}
              {isFavorite ? "Suivi" : "Suivre"}
            </button>

            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold shadow transition-all ${
                isLiked
                  ? "bg-rose-500 text-white"
                  : "bg-white/90 text-gray-700 hover:bg-rose-50"
              }`}
            >
              <FaHeart size={12} className={isLiked ? "text-white" : "text-rose-400"} />
              {likeCount}
            </button>
          </div>
        )}
      </div>

      {/* ── Identité ─────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold">{fullName}</h1>
          {profile.isProfileVerified && (
            <FaShield className="text-blue-500" size={16} title="Profil vérifié" />
          )}
        </div>
        <p className="text-sm text-gray-500">
          {schoolRoleLabel(profile.schoolRole)} à La Cité
        </p>
        <p className="mt-0.5 text-xs font-medium text-blue-600">{roleLabel(profile.role)}</p>

        {profile.bio && (
          <p className="mt-3 text-sm leading-relaxed text-gray-600">{profile.bio}</p>
        )}

        {/* Langues */}
        {profile.languagesSpoken?.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {profile.languagesSpoken.map((l) => (
              <span
                key={l}
                className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600"
              >
                {l.toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ── Stats conducteur ──────────────────────────────────────────────── */}
      {isDriver && dp && (
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-amber-50 p-3 text-center">
            <p className="text-lg font-bold text-amber-600">
              {dp.averageRating.toFixed(1)}
              <span className="text-sm"> / 5</span>
            </p>
            <p className="text-xs text-gray-500">Note</p>
          </div>
          <div className="rounded-xl bg-blue-50 p-3 text-center">
            <p className="text-lg font-bold text-blue-600">{dp.totalTripsAsDriver}</p>
            <p className="text-xs text-gray-500">Trajets</p>
          </div>
          <div className="rounded-xl bg-green-50 p-3 text-center">
            <FaLeaf className="mx-auto mb-0.5 text-green-500" size={14} />
            <p className="text-sm font-bold text-green-600">
              {dp.co2SavedKg.toFixed(1)} kg
            </p>
            <p className="text-xs text-gray-500">CO₂ évité</p>
          </div>
        </div>
      )}

      {/* ── Photo véhicule (conducteur uniquement) ────────────────────────── */}
      {isDriver && dp?.vehiclePhotoUrl && (
        <div className="mb-6">
          <div className="relative h-36 w-full overflow-hidden rounded-2xl bg-gray-100">
            <Image
              src={dp.vehiclePhotoUrl}
              alt={`${dp.vehicleMake ?? ""} ${dp.vehicleModel ?? ""}`}
              fill
              className="object-cover"
            />
          </div>
          {dp.vehicleMake && (
            <p className="mt-1.5 text-center text-xs text-gray-400">
              {dp.vehicleMake} {dp.vehicleModel} {dp.vehicleColor ? `· ${dp.vehicleColor}` : ""}
              {dp.vehicleYear ? `, ${dp.vehicleYear}` : ""}
            </p>
          )}
        </div>
      )}

      {/* ── Trajets récurrents habituels (conducteur uniquement) ──────────── */}
      {isDriver && profile.usualTrips?.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Itinéraires habituels
          </h2>
          <div className="flex flex-col gap-2">
            {profile.usualTrips.map((t, i) => (
              <ProfileUsualTripCard
                key={i}
                departure={t.departureLabel}
                arrival={t.arrivalLabel}
                driverId={id}
                driverName={fullName}
                onSubscribe={handleSubscribe}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Avis reçus ────────────────────────────────────────────────────── */}
      {profile.recentReviews?.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Avis reçus ({profile.recentReviews.length})
          </h2>
          <div className="flex flex-col gap-3">
            {profile.recentReviews.map((r, i) => (
              <div key={i} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {r.reviewerAvatar ? (
                      <Image
                        src={r.reviewerAvatar}
                        alt={r.reviewerName}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
                        {r.reviewerName[0]}
                      </div>
                    )}
                    <span className="text-sm font-medium">{r.reviewerName}</span>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <StarRating rating={r.rating} />
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("fr-CA", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                {r.comment && (
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Derniers trajets publiés ──────────────────────────────────────── */}
      {isDriver && profile.recentPublishedTrips?.length > 0 && (
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
            Trajets disponibles
          </h2>
          <div className="flex flex-col gap-3">
            {profile.recentPublishedTrips.map((t) => (
              <Link
                key={t.id}
                href={`/trips/${t.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-sm font-semibold">
                    <FaLocationDot size={11} className="shrink-0 text-blue-500" />
                    <span className="truncate">{t.departureLabel}</span>
                    <FaArrowRight size={10} className="shrink-0 text-gray-400" />
                    <span className="truncate">{t.arrivalLabel}</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {new Date(t.departureDate).toLocaleDateString("fr-CA", {
                      day: "numeric",
                      month: "short",
                    })}{" "}
                    · {t.departureTime?.substring(0, 5)}
                  </p>
                </div>
                <div className="ml-3 shrink-0 text-right">
                  <p className="text-sm font-bold text-blue-600">{t.pricePerPassenger}$</p>
                  <p className="text-xs text-gray-400">{t.availableSeats} place{t.availableSeats > 1 ? "s" : ""}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── GoScore ───────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">GoScore</p>
            <p className="text-2xl font-bold text-blue-700">{profile.goScore}</p>
          </div>
          <p className="text-xs text-gray-400">
            Membre depuis{" "}
            {new Date(profile.createdAt).toLocaleDateString("fr-CA", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </main>
  );
}
