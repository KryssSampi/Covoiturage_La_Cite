"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Language, useAppState } from "@/core/state/app_state";
import { useProfileActions } from "@/features/profile/hooks/useProfileActions";
import type { Trip, Review } from "@/features/dashboard/types";
import type { UsualTrip, UserPublic, DriverProfilePublic, PublicReview, PublicTrip } from "@/features/profile/types/profile.types";
import {
  ProfileBanner,
  ProfileHeaderSection,
  ProfileBadgesSection,
  ProfileStatsSection,
  ProfileReviewsSection,
  ProfileRecurringTripsSection,
  ProfilePublishedTripsSection,
} from "@/features/profile/components/public-profile";
import { Badge } from "@/features/profile/fixtures/profile.fixtures";

// ── Helpers ───────────────────────────────────────────────────────────────────

function schoolRoleLabel(role: string, isFR: boolean): string {
  const mapFR: Record<string, string> = {
    etudiant: "Étudiant",
    professeur: "Professeur",
    membredupersonnel: "Membre du personnel",
    administrateur: "Administrateur",
  };
  const mapEN: Record<string, string> = {
    etudiant: "Student",
    professeur: "Professor",
    membredupersonnel: "Staff Member",
    administrateur: "Administrator",
  };
  const map = isFR ? mapFR : mapEN;
  return map[String(role ?? "").toLowerCase()] ?? role;
}

// ── Traductions ───────────────────────────────────────────────────────────────

const translations = {
  fr: {
    profileSummary: "Profile Summary",
    trips: "trajets",
    favorite: "Favori",
    subscription: "Ajouter au favoris",
    bio: "Bio",
    badges: "Badges",
    languages: "Langues",
    french: "Français",
    english: "Anglais",
    vehicle: "Véhicule",
    statistics: "Statistique",
    goScore: "Go Score",
    tripCount: "Nombre de Trajets",
    globalRating: "Note Globale",
    co2Savings: "Économie CO2",
    co2Avoided: "CO₂ évitées",
    reviews: "Avis",
    recurringTrips: "Trajets Récurrents",
    subscribe: "S'abonner",
    publishedTrips: "Trajets Publiés",
    availableSeats: "places dispo",
    vehicleLabel: "Véhicule",
    book: "Réserver",
    atlacite: "à La Cité",
    actually: "Actuellement",
    loading: "Chargement...",
    notFound: "Profil introuvable",
  },
  en: {
    profileSummary: "Profile Summary",
    trips: "trips",
    favorite: "Favorite",
    subscription: "Add to Favorites",
    bio: "Bio",
    badges: "Badges",
    languages: "Languages",
    french: "French",
    english: "English",
    vehicle: "Vehicle",
    statistics: "Statistics",
    goScore: "Go Score",
    tripCount: "Number of Trips",
    globalRating: "Global Rating",
    co2Savings: "CO2 Savings",
    co2Avoided: "CO₂ avoided",
    reviews: "Reviews",
    recurringTrips: "Recurring Trips",
    subscribe: "Subscribe",
    publishedTrips: "Published Trips",
    availableSeats: "seats available",
    vehicleLabel: "Vehicle",
    book: "Book",
    atlacite: "at La Cité",
    actually: "Currently",
    loading: "Loading...",
    notFound: "Profile not found",
  },
};

// ── Convertir PublicTrip en Trip pour RecommendedTripCard ─────────────────────

function toTripDto(item: PublicTrip, driverName: string): Trip {
  return {
    id: item.id,
    departure: item.departureLabel,
    destination: item.arrivalLabel,
    date: item.departureDate,
    time: item.departureTime?.substring(0, 5) ?? "",
    price: item.pricePerPassenger,
    maxPassengers: item.availableSeats + 1,
    passengers: [],
    driver: {
      id: "driver-1",
      name: driverName,
      rating: 4.8,
      tripsCount: 142,
      pictureUrl: "/assets/placeholder/placeholer-profile-picture.png",
    },
    doneDate: null,
  };
}

// ── Page Principale (Orchestrateur) ───────────────────────────────────────────

export default function PublicProfilePage() {
  const { lang, userConnected } = useAppState();
  const params = useParams();
  const profileId = params?.id as string | undefined;
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  const [profile, setProfile] = useState<UserPublic | null>(null);
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [publishedTrips, setPublishedTrips] = useState<PublicTrip[]>([]);
  const [usualTrips, setUsualTrips] = useState<UsualTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Fetch profile data
  useEffect(() => {
    if (!profileId) return;

    (async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.allSettled([
          fetch(`/api/users/${profileId}/public`),
          fetch(`/api/reviews?revieweeId=${profileId}`),
        ]);

        if (profileRes.status === 'fulfilled' && profileRes.value.ok) {
          const data = await profileRes.value.json();
          setProfile(data);
          setLikeCount(data.likesCount ?? 0);
          setIsLiked(data.isLikedByMe ?? false);
          setIsFavorite(data.isFavorite ?? false);
        }

        if (reviewsRes.status === 'fulfilled' && reviewsRes.value.ok) {
          const rows = await reviewsRes.value.json();
          setReviews((rows as Array<{ reviewerName: string; reviewerId?: string; reviewerAvatar?: string; rating: number; comment?: string; createdAt: string }>).map((r, i) => ({
            id: r.reviewerId ?? `review-${i}`,
            reviewerName: r.reviewerName,
            reviewerId: r.reviewerId,
            reviewerAvatar: r.reviewerAvatar,
            rating: r.rating,
            comment: r.comment ?? "",
            createdAt: r.createdAt,
          })));
        }
      } catch (err) {
        console.error('[profile/[id]] fetch data', err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [profileId]);

  const handleLikeChange = (liked: boolean, count: number) => {
    setIsLiked(liked);
    setLikeCount(count);
  };

  const handleFavoriteChange = (favorite: boolean) => {
    setIsFavorite(favorite);
  };

  const { handleLike, handleFavorite, handleSubscribe } = useProfileActions({
    targetUserId: profile?.id ?? '',
    isLiked,
    isFavorite,
    likeCount,
    onLikeChange: handleLikeChange,
    onFavoriteChange: handleFavoriteChange,
  });

  const fullName = profile ? `${profile.firstName} ${profile.lastName}` : '';
  const isSelf = userConnected?.id === profile?.id;

  const dashboardReviews: Review[] = useMemo(() =>
    reviews.map((review, index) => ({
      id: review.id ?? `review-${index}`,
      reviewer: review.reviewerName,
      reviewerId: review.reviewerId ?? "",
      revieweeId: profile?.id ?? "",
      reviewerpicture: review.reviewerAvatar ?? "/assets/placeholder/placeholer-profile-picture.png",
      rating: review.rating,
      date: review.createdAt,
      comment: review.comment ?? "",
      tags: [],
      tripId: null,
      createdAt: review.createdAt,
    })), [reviews, profile?.id]);

  const tripDtos = useMemo(() =>
    publishedTrips.map((item) => toTripDto(item, fullName)),
    [publishedTrips, fullName]);

  if (isLoading) {
    return <div className="mx-auto w-7xl px-4 py-6 text-center text-gray-500">{t.loading}</div>;
  }

  if (!profile) {
    return <div className="mx-auto w-7xl px-4 py-6 text-center text-gray-500">{t.notFound}</div>;
  }

  const dp = profile.driverProfile;

  return (
    <main className="mx-auto w-7xl px-4 py-6 text-gray-800">
      <ProfileBanner
        bannerSrc="/img/planifier-background.png"
        alt="Banner"
      />

      <ProfileHeaderSection
        avatarUrl={profile.avatarUrl}
        fullName={fullName}
        isProfileVerified={profile.isProfileVerified}
        schoolRoleLabel={schoolRoleLabel(profile.schoolRole, isFR)}
        atlacite={t.atlacite}
        actually={t.actually}
        role={profile.role}
        bio={profile.bio}
        bioLabel={t.bio}
        isSelf={isSelf}
        isLiked={isLiked}
        likeCount={likeCount}
        subscriptionLabel={t.subscription}
        onLike={handleLike}
        onFavorite={handleFavorite}
      />

      <ProfileBadgesSection
        badgesLabel={t.badges}
        badges={[] as Badge[]}
        languagesLabel={t.languages}
        frenchLabel={t.french}
        englishLabel={t.english}
        vehicleLabel={t.vehicle}
        vehiclePhotoUrl={dp?.vehiclePhotoUrl}
        vehicleMake={dp?.vehicleMake}
        vehicleModel={dp?.vehicleModel}
        vehicleColor={dp?.vehicleColor}
        vehicleYear={dp?.vehicleYear}
      />

      <ProfileStatsSection
        statisticsLabel={t.statistics}
        goScoreLabel={t.goScore}
        goScore={profile.goScore ?? 0}
        tripCountLabel={t.tripCount}
        tripCount={dp?.totalTripsAsDriver ?? 0}
        globalRatingLabel={t.globalRating}
        globalRating={dp?.averageRating?.toFixed(1) ?? "N/A"}
        co2SavingsLabel={t.co2Savings}
        co2Savings={`${((dp?.co2SavedKg ?? 0) / 1000).toFixed(1)} T.`}
      />

      <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <ProfileReviewsSection
          reviewsLabel={t.reviews}
          reviews={dashboardReviews}
          lang={lang}
        />
        <ProfileRecurringTripsSection
          recurringTripsLabel={t.recurringTrips}
          trips={usualTrips}
          driverId={profile.id}
          driverName={fullName}
          onSubscribe={(departure, arrival) =>
            handleSubscribe(departure, arrival, fullName)
          }
        />
      </div>

      <ProfilePublishedTripsSection
        publishedTripsLabel={t.publishedTrips}
        trips={tripDtos}
      />
    </main>
  );
}