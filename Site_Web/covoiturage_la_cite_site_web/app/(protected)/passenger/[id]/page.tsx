
"use client";

import { useAppState } from "@/core/state/app_state";
import { useParams } from "next/navigation";
import { useEffect } from "react";
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

export default function PassengerDashboardPage() {
  const appState = useAppState();
  const router = useRouter();
  const params = useParams();
  const isBelowLg = useIsMobileOrTablet();
  const user = appState.userConnected;
  const { setActiveLoader } = useLoader();
  
  // Effet pour vérifier l'authentification et les permissions de l'utilisateur
  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié et a les bonnes permissions
    if (
      user?.id !== params.id ||
      user?.role.toString().toLowerCase() !== "passenger"
    ) {
      setActiveLoader(true);
      router.push(`/${user?.role.toString().toLowerCase()}/${user?.id}`);
    } else {
      // Ajouter un délai pour plus de fluidité lors du chargement
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [user, params, router, setActiveLoader]);


  // Vérifier que l'utilisateur a les bonnes permissions avant d'afficher le contenu
  if (user?.id !== params.id || user?.role.toString().toLowerCase() !== "passenger") {
    return null;
  }
  else {
    // Le contenu du dashboard pour les passagers
  return (
    // DashboardProvider centralise toutes les données du feature dashboard
    <DashboardProvider>
      <div className="flex flex-col mb-10">
      <Hero />
      {!isBelowLg ? (
        <main className="w-full  h-full flex flex-col bg-gray-100  px-10 py-5 scale-y-105 ">
          <div className="w-full h-fit flex items-center justify-between  mb-6">
            <div className="w-full h-full flex flex-col gap-6  pr-1">
              <ReservationsSection />
              <FavoritesSection />
              <ReviewsSection />
              <div className="flex">
                <RecentsDestinationsSection />
                <UsualDestinationsSection />
              </div>
              <RecommendedRidesSection />
            </div>
            <div className="w-2/7 h-full flex flex-col gap-6 pl-5 ">
              <StatisticSection />
              <NotificationsSection />
              <GoBoard />
              <LaCiteAstucesSection />
            </div>
          </div>
          <div className="px-10">
            <NouveautesSection />
          </div>
        </main>
      ) : (
        <main className="w-full -mb-10 h-full flex flex-col bg-gray-100 gap-y-5  shadow-md py-2 px-3 scale-100">
          <ReservationsSection />
          <NotificationsSection />
          <StatisticSection />
          <FavoritesSection />
          <ReviewsSection />
          <GoBoard />
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