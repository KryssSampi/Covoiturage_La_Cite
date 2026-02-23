/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useAppState } from "@/core/state/app_state";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect } from "react";
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
import { useState } from "react";
import { useLoader } from "@/core/context/loader.context";
import { PublishedTripSection, ReservationRequestsSection, QuickPlanSection, FinanceSection } from "@/features/dashboard/components/driver"; // À ajuster selon l'organisation finale des composants

export default function DriverDashboardPage() {
  const appState = useAppState();
  const params = useParams();
  const router = useRouter();
  const isBelowLg = useIsMobileOrTablet();
  const { setActiveLoader } = useLoader();
  const user = appState.userConnected;

  // État pour suivre si le composant est monté côté client
  const [mounted, setMounted] = useState(false);
  
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
        <main className="w-full h-full flex flex-col bg-white  px-10 py-10 scale-y-105">
          <div className="w-full h-fit flex items-center justify-between mb-6">
            <div className="w-full h-full flex flex-col gap-6  pr-5">
              <PublishedTripSection />
              <ReservationRequestsSection />
              <ReviewsSection />
              <QuickPlanSection />
              <div className="w-full h-full flex gap-6 pl-5 pr-5">
                <StatisticSection />
                <GoBoard />
              </div>
            </div>
            <div className="w-2/7 h-full flex flex-col gap-6 pl-5 ">
              <NotificationsSection />
              <FavoritesSection />
              <FinanceSection />
              <LaCiteAstucesSection />
            </div>
          </div>
          <div className="px-10">
            <NouveautesSection />
          </div>
        </main>
      ) : (
        <main className="w-full -mb-10 h-full flex flex-col bg-white gap-y-5  shadow-md py-2 px-3 scale-100">
          <PublishedTripSection />
          <ReservationRequestsSection />
          <NotificationsSection />
          <FinanceSection />
          <FavoritesSection />
          <ReviewsSection />
          <QuickPlanSection />
          <StatisticSection />
          <GoBoard />
          <LaCiteAstucesSection />
          <NouveautesSection />
        </main>
      )}
    </div>
  );
}
