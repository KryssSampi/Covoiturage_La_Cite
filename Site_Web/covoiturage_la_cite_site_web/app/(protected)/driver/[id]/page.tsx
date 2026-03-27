"use client";

import { useAppState } from "@/core/state/app_state";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
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
import {
  PublishedTripSection,
  ReservationRequestsSection,
  QuickPlanSection,
  FinanceSection,
} from "@/features/dashboard/components/driver";
import { DashboardProvider } from "@/features/dashboard/context/DashboardContext";
import type {
  ReservationRequest,
  Notification,
  Review,
  UserStatsSummary,
  PublishedTrip,
  DriverFinanceSummary,
  GoTask,
  Tip,
} from "@/features/dashboard/types";
import type { LieuFavoriUnifie } from "@/shared/types/lieu-favori.types";
import { getLieuFavoriIcon } from "@/shared/utils/lieu-favori-icon";
import type { DraftTrip } from "@/features/brouillons/types";
import { FIXTURE_DRAFTS } from "@/tests/fixtures/brouillons/drafts.fixtures";
import { FIXTURE_GO_TASKS } from "@/tests/fixtures/dashboard/goboard.fixtures";
import { LACITE_TIPS } from "@/tests/fixtures/dashboard/lacite_astuces.fixtures";
import { FIXTURE_LIEUX_FAVORIS } from "@/shared/fixtures/favoris.fixtures";
import { FIXTURE_DRIVER_FINANCE } from "@/tests/fixtures/dashboard/finance.fixtures";

interface DriverDashboardData {
  publishedTrips: PublishedTrip[];
  reservationRequests: ReservationRequest[];
  notifications: Notification[];
  reviews: Review[];
  stats: UserStatsSummary;
}

const DEFAULT_STATS: UserStatsSummary = {
  tripsCount: 0,
  co2SavedKg: 0,
  averageRating: 0,
  goScore: 0,
};

export default function DriverDashboardPage() {
  const appState = useAppState();
  const params = useParams();
  const router = useRouter();
  const isBelowLg = useIsMobileOrTablet();
  const { setActiveLoader } = useLoader();
  const user = appState.userConnected;
  const routeId = typeof params.id === "string" ? params.id : params.id?.[0];

  const [dashData, setDashData] = useState<DriverDashboardData | null>(null);
  const [finance, setFinance] = useState<DriverFinanceSummary>(FIXTURE_DRIVER_FINANCE);
  const [favorites, setFavorites] = useState<LieuFavoriUnifie[]>(FIXTURE_LIEUX_FAVORIS);
  const [tips, setTips] = useState<Tip[]>(LACITE_TIPS);
  const [drafts, setDrafts] = useState<DraftTrip[]>(FIXTURE_DRAFTS);
  const [goTasks, setGoTasks] = useState<GoTask[]>(FIXTURE_GO_TASKS);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isTripsLoading, setIsTripsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setActiveLoader(true);
      router.replace("/");
    } else if (
      user.id !== routeId ||
      user.role.toString().toLowerCase() !== "driver"
    ) {
      setActiveLoader(true);
      router.replace(`/${user.role.toString().toLowerCase()}/${user.id}`);
    } else {
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [routeId, router, setActiveLoader, user]);

  const loadDriverData = useCallback(async () => {
    if (!user) return;
    setIsTripsLoading(true);
    try {
      const [dashboardRes, financeRes, favoritesRes, astucesRes, draftsRes, goTasksRes] = await Promise.all([
        fetch(`/api/dashboard/driver/${user.id}`),
        fetch(`/api/dashboard/driver/${user.id}/finance`),
        fetch(`/api/lieux-favoris?userId=${user.id}`),
        fetch("/api/astuces"),
        fetch(`/api/drafts?driverId=${user.id}`),
        fetch("/api/gotasks"),
      ]);

      if (dashboardRes.ok) {
        setDashData(await dashboardRes.json());
      }
      if (financeRes.ok) {
        setFinance(await financeRes.json());
      }
      if (favoritesRes.ok) {
        const payload = await favoritesRes.json();
        if (Array.isArray(payload)) setFavorites(payload);
      }
      if (astucesRes.ok) {
        const payload = await astucesRes.json();
        if (Array.isArray(payload) && payload.length > 0) setTips(payload);
      }
      if (draftsRes.ok) {
        const payload = await draftsRes.json();
        if (Array.isArray(payload) && payload.length > 0) setDrafts(payload);
      }
      if (goTasksRes.ok) {
        const payload = await goTasksRes.json();
        if (Array.isArray(payload) && payload.length > 0) setGoTasks(payload);
      }
    } catch (error) {
      console.error("[driver/page] loadDriverData", error);
    } finally {
      setIsTripsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user || user.role.toString().toLowerCase() !== "driver") return;
    if (user.id !== routeId) return;
    void loadDriverData();
  }, [loadDriverData, routeId, user]);

  const handleAcceptRequest = useCallback(async (id: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(id)}/accept`, {
        method: "POST",
        headers: { "x-caller-id": user?.id ?? "" },
      });
      if (!res.ok) return false;
      await loadDriverData();
      return true;
    } catch (error) {
      console.error(`[driver/page] handleAcceptRequest - id: ${id}`, error);
      return false;
    } finally {
      setIsActionLoading(false);
    }
  }, [loadDriverData, user?.id]);

  const handleRejectRequest = useCallback(async (id: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(id)}/reject`, {
        method: "POST",
        headers: { "x-caller-id": user?.id ?? "" },
      });
      if (!res.ok) return false;
      await loadDriverData();
      return true;
    } catch {
      return false;
    } finally {
      setIsActionLoading(false);
    }
  }, [loadDriverData, user?.id]);

  const handleCancelTrip = useCallback(async (tripId: string): Promise<void> => {
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) {
        console.error(
          `[driver/page] handleCancelTrip - tripId: ${tripId} - response not ok`,
        );

      }
      await loadDriverData();
    } catch (error) {
      console.error(`[driver/page] handleCancelTrip - tripId: ${tripId}`, error);

    }
  }, [loadDriverData]);

  const handleStartTrip = useCallback(async (tripId: string) => {
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      if (res.ok) await loadDriverData();
    } catch { /* silencieux */ }
  }, [loadDriverData]);

  const handleDeleteFavorite = useCallback(async (favorite: LieuFavoriUnifie) => {
    await fetch(`/api/lieux-favoris?id=${favorite.id}&userId=${user?.id}`, {
      method: "DELETE",
    });
    setFavorites((prev) => prev.filter((item) => item.id !== favorite.id));
  }, [user?.id]);

  if (user?.id !== routeId || user?.role.toString().toLowerCase() !== "driver") {
    return null;
  }

  const favDestinations = favorites.map((fav) => ({
    label: fav.pseudonyme,
    value: fav.adresse,
    icon: getLieuFavoriIcon(fav.iconTag, ""),
    coordonnees: fav.coordonnees,
  }));

  return (
    <DashboardProvider>
      <div className="flex flex-col mb-10">
        <Hero favDestinations={favDestinations} />
        {!isBelowLg ? (
          <main className="w-full h-full flex flex-col bg-white  px-10 py-10 scale-y-105">
            <div className="w-full h-fit flex items-center justify-between mb-6">
              <div className="w-full h-full flex flex-col gap-6  pr-5">
                <PublishedTripSection
                  trips={dashData?.publishedTrips ?? []}
                  onCancelTrip={handleCancelTrip}
                  onStartTrip={handleStartTrip}
                  isLoading={isTripsLoading}
                  onRefresh={loadDriverData}
                />
                <ReservationRequestsSection
                  requests={dashData?.reservationRequests ?? []}
                  onAcceptRequest={handleAcceptRequest}
                  onRejectRequest={handleRejectRequest}
                  isActionLoading={isActionLoading}
                />
                <ReviewsSection reviews={dashData?.reviews ?? []} />
                <QuickPlanSection drafts={drafts} />
                <div className="w-full h-full flex gap-6 pl-5 pr-5">
                  <StatisticSection stats={dashData?.stats ?? DEFAULT_STATS} />
                  <GoBoard currentScore={dashData?.stats?.goScore ?? 0} tasks={goTasks} />
                </div>
              </div>
              <div className="w-2/7 h-full flex flex-col gap-6 pl-5 ">
                <NotificationsSection notifications={dashData?.notifications ?? []} />
                <FavoritesSection favorites={favorites} onDeleteFavorite={handleDeleteFavorite} />
                <FinanceSection finance={finance} />
                <LaCiteAstucesSection tips={tips} />
              </div>
            </div>
            <div className="px-10">
              <NouveautesSection />
            </div>
          </main>
        ) : (
          <main className="w-full -mb-10 h-full flex flex-col bg-white gap-y-5  shadow-md py-2 px-3 scale-100">
            <PublishedTripSection
              trips={dashData?.publishedTrips ?? []}
              onCancelTrip={handleCancelTrip}
              onStartTrip={handleStartTrip}
            />
            <ReservationRequestsSection
              requests={dashData?.reservationRequests ?? []}
              onAcceptRequest={handleAcceptRequest}
              onRejectRequest={handleRejectRequest}
              isActionLoading={isActionLoading}
            />
            <NotificationsSection notifications={dashData?.notifications ?? []} />
            <FinanceSection finance={finance} />
            <FavoritesSection favorites={favorites} onDeleteFavorite={handleDeleteFavorite} />
            <ReviewsSection reviews={dashData?.reviews ?? []} />
            <QuickPlanSection drafts={drafts} />
            <StatisticSection stats={dashData?.stats ?? DEFAULT_STATS} />
            <GoBoard currentScore={dashData?.stats.goScore ?? 0} tasks={goTasks} />
            <LaCiteAstucesSection tips={tips} />
            <NouveautesSection />
          </main>
        )}
      </div>
    </DashboardProvider>
  );
}
