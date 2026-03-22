
"use client";

import { useAppState } from "@/core/state/app_state";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FavoritesSection,
  GoBoard,
  Hero,
  LaCiteAstucesSection,
  NotificationsSection,
  NouveautesSection,
  ReviewsSection,
  StatisticSection,
} from "@/features/dashboard/components/shared";
import { useIsMobileOrTablet } from "@/shared/hooks/useismobileortable";
import { useLoader } from "@/core/context/loader.context";
import { RecentsDestinationsSection, UsualDestinationsSection, RecommendedRidesSection, ReservationsSection } from "@/features/dashboard/components/passenger";
import { DashboardProvider } from "@/features/dashboard/context/DashboardContext";
import type {
  Reservation,
  Notification,
  Review,
  UserStatsSummary,
} from "@/features/dashboard/types";

// Forme de la réponse de l'API dashboard passager
interface PassengerDashboardData {
  reservations: Reservation[];
  notifications: Notification[];
  reviews: Review[];
  stats: UserStatsSummary;
}

// Valeurs par défaut pour les données non encore chargées
const DEFAULT_STATS: UserStatsSummary = {
  tripsCount: 0,
  co2SavedKg: 0,
  averageRating: 0,
  goScore: 0,
};

export default function PassengerDashboardPage() {
  const appState = useAppState();
  const router = useRouter();
  const params = useParams();
  const isBelowLg = useIsMobileOrTablet();
  const user = appState.userConnected;
  const { setActiveLoader } = useLoader();

  // Données du dashboard chargées depuis l'API
  const [dashData, setDashData] = useState<PassengerDashboardData | null>(null);

  // Effet pour vérifier l'authentification et les permissions de l'utilisateur
  useEffect(() => {
    if (
      user?.id !== params.id ||
      user?.role.toString().toLowerCase() !== "passenger"
    ) {
      setActiveLoader(true);
      router.push(`/${user?.role.toString().toLowerCase()}/${user?.id}`);
    } else {
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [user, params, router, setActiveLoader]);

  // Chargement des données du dashboard depuis l'API une fois l'utilisateur confirmé
  useEffect(() => {
    if (!user || user.role.toString().toLowerCase() !== "passenger") return;
    if (user.id !== params.id) return;

    fetch(`/api/dashboard/passenger/${user.id}`)
      .then((res) => res.json())
      .then((data: PassengerDashboardData) => setDashData(data))
      .catch(console.error);
  }, [user, params.id]);

  // Vérifier que l'utilisateur a les bonnes permissions avant d'afficher le contenu
  if (user?.id !== params.id || user?.role.toString().toLowerCase() !== "passenger") {
    return null;
  }
  else {
    // Le contenu du dashboard pour les passagers
  return (
    // DashboardProvider centralise les données pour les composants non-critiques (GoBoard, Favoris, etc.)
    <DashboardProvider>
      <div className="flex flex-col mb-10">
      <Hero />
      {!isBelowLg ? (
        <main className="w-full  h-full flex flex-col bg-gray-100  px-10 py-5 scale-y-105 ">
          <div className="w-full h-fit flex items-center justify-between  mb-6">
            <div className="w-full h-full flex flex-col gap-6  pr-1">
              <ReservationsSection reservations={dashData?.reservations ?? []} />
              <FavoritesSection />
              <ReviewsSection reviews={dashData?.reviews ?? []} />
              <div className="flex">
                <RecentsDestinationsSection />
                <UsualDestinationsSection />
              </div>
              <RecommendedRidesSection />
            </div>
            <div className="w-2/7 h-full flex flex-col gap-6 pl-5 ">
              <StatisticSection stats={dashData?.stats ?? DEFAULT_STATS} />
              <NotificationsSection notifications={dashData?.notifications ?? []} />
              <GoBoard currentScore={dashData?.stats.goScore ?? 0} />
              <LaCiteAstucesSection />
            </div>
          </div>
          <div className="px-10">
            <NouveautesSection />
          </div>
        </main>
      ) : (
        <main className="w-full -mb-10 h-full flex flex-col bg-gray-100 gap-y-5  shadow-md py-2 px-3 scale-100">
          <ReservationsSection reservations={dashData?.reservations ?? []} />
          <NotificationsSection notifications={dashData?.notifications ?? []} />
          <StatisticSection stats={dashData?.stats ?? DEFAULT_STATS} />
          <FavoritesSection />
          <ReviewsSection reviews={dashData?.reviews ?? []} />
          <GoBoard currentScore={dashData?.stats.goScore ?? 0} />
          <RecentsDestinationsSection />
          <UsualDestinationsSection />
          <RecommendedRidesSection />
          <LaCiteAstucesSection />
          <NouveautesSection />
        </main>
      )}
    </div>
    </DashboardProvider>
  );
}
}