
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

export default function PassengerDashboardPage() {
  const appState = useAppState();
  const router = useRouter();
  const params = useParams();
  const isBelowLg = useIsMobileOrTablet();
  const user = appState.userConnected;
  const { setActiveLoader } = useLoader();
  // État pour tracker le montage du composant en côté client
  const [mounted, setMounted] = useState(false);

  // Effet pour initialiser le montage du composant au chargement
  useEffect(() => {
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Effet pour vérifier l'authentification et les permissions de l'utilisateur
  useEffect(() => {
    if (!user) {
      setActiveLoader(true);
      router.replace("/");
    } else if (
      user.id !== params.id ||
      user.role.toString().toLowerCase() !== "passenger"
    ) {
      setActiveLoader(true);
      router.push(`/${user.role.toString().toLowerCase()}/${user.id}`);
    }
  }, [user, params, router, setActiveLoader]);

  // Effet pour synchroniser le Loader avec l'état de montage
  // Cet effet s'exécute APRÈS le rendu, ce qui est légal et propre.
  useEffect(() => {
    if (!mounted) {
      setActiveLoader(true);
    } else {
      // On ajoute un léger délai pour plus de fluidité
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [mounted, setActiveLoader]);

  if (!mounted) return null; // On peut aussi retourner un loader ici si on veut

  return (
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
  );
}
