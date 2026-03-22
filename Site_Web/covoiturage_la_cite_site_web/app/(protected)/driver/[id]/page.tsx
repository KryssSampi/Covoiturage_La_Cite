/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useAppState } from "@/core/state/app_state";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
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
import { PublishedTripSection, ReservationRequestsSection, QuickPlanSection, FinanceSection } from "@/features/dashboard/components/driver";
import { DashboardProvider } from "@/features/dashboard/context/DashboardContext";
import type {
  ReservationRequest,
  Notification,
  Review,
  UserStatsSummary,
} from "@/features/dashboard/types";

// Forme de la réponse de l'API dashboard conducteur
interface DriverDashboardData {
  reservationRequests: ReservationRequest[];
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

// DEFAULT_FINANCE supprimé — FinanceSection gère son propre état via useLiveFinance

export default function DriverDashboardPage() {
  const appState = useAppState();
  const params = useParams();
  const router = useRouter();
  const isBelowLg = useIsMobileOrTablet();
  const { setActiveLoader } = useLoader();
  const user = appState.userConnected;

  // État pour suivre si le composant est monté côté client
  const [mounted, setMounted] = useState(false);

  // Données du dashboard chargées depuis l'API
  const [dashData, setDashData] = useState<DriverDashboardData | null>(null);

  // Cet effet utilise useLayoutEffect pour marquer le composant comme monté avant le rendu
  useLayoutEffect(() => {
    setMounted(true);
  }, []);

  // Cet effet gère la redirection et l'authentification de l'utilisateur
  useEffect(() => {
    if (!mounted) return;

    if (!user) {
      setActiveLoader(true);
      router.replace("/");
    } else if (
      user.id !== params.id ||
      user.role.toString().toLowerCase() !== "driver"
    ) {
      setActiveLoader(true);
      router.push(`/${user.role.toString().toLowerCase()}/${user.id}`);
    }
  }, [mounted, user, params, router, setActiveLoader]);

  // Cet effet synchronise le Loader avec l'état de montage
  useEffect(() => {
    if (!mounted) {
      setActiveLoader(true);
    } else {
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [mounted, setActiveLoader]);

  // Chargement des données du dashboard depuis l'API une fois l'utilisateur confirmé
  useEffect(() => {
    if (!mounted || !user || user.role.toString().toLowerCase() !== "driver") return;
    if (user.id !== params.id) return;

    fetch(`/api/dashboard/driver/${user.id}`)
      .then((res) => res.json())
      .then((data: DriverDashboardData) => setDashData(data))
      .catch(console.error);
  }, [mounted, user, params.id]);

  if (!mounted || user?.id !== params.id || user?.role.toString().toLowerCase() !== "driver") {
    setActiveLoader(true);
    return null;
  } else {
  return (
    // DashboardProvider centralise les données pour les composants non-critiques (GoBoard, Favoris, etc.)
    <DashboardProvider>
      <div className="flex flex-col mb-10">
      <Hero />
      {!isBelowLg ? (
        <main className="w-full h-full flex flex-col bg-white  px-10 py-10 scale-y-105">
          <div className="w-full h-fit flex items-center justify-between mb-6">
            <div className="w-full h-full flex flex-col gap-6  pr-5">
              <PublishedTripSection driverId={user.id} />
              <ReservationRequestsSection requests={dashData?.reservationRequests ?? []} />
              <ReviewsSection reviews={dashData?.reviews ?? []} />
              <QuickPlanSection />
              <div className="w-full h-full flex gap-6 pl-5 pr-5">
                <StatisticSection stats={dashData?.stats ?? DEFAULT_STATS} />
                <GoBoard currentScore={dashData?.stats?.goScore ?? 0} />
              </div>
            </div>
            <div className="w-2/7 h-full flex flex-col gap-6 pl-5 ">
              <NotificationsSection notifications={dashData?.notifications ?? []} />
              <FavoritesSection />
              <FinanceSection driverId={user.id} />
              <LaCiteAstucesSection />
            </div>
          </div>
          <div className="px-10">
            <NouveautesSection />
          </div>
        </main>
      ) : (
        <main className="w-full -mb-10 h-full flex flex-col bg-white gap-y-5  shadow-md py-2 px-3 scale-100">
          <PublishedTripSection driverId={user.id} />
          <ReservationRequestsSection requests={dashData?.reservationRequests ?? []} />
          <NotificationsSection notifications={dashData?.notifications ?? []} />
          <FinanceSection driverId={user.id} />
          <FavoritesSection />
          <ReviewsSection reviews={dashData?.reviews ?? []} />
          <QuickPlanSection />
          <StatisticSection stats={dashData?.stats ?? DEFAULT_STATS} />
          <GoBoard currentScore={dashData?.stats.goScore ?? 0} />
          <LaCiteAstucesSection />
          <NouveautesSection />
        </main>
      )}
    </div>
    </DashboardProvider>
  );
}
}