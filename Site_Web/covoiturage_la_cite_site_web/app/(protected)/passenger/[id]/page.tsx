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
  RecentsDestinationsSection,
  UsualDestinationsSection,
  RecommendedRidesSection,
  ReservationsSection,
} from "@/features/dashboard/components/passenger";
import { DashboardProvider } from "@/features/dashboard/context/DashboardContext";
import type {
  Reservation,
  Notification,
  Review,
  UserStatsSummary,
  GoTask,
  Tip,
} from "@/features/dashboard/types";
import type { LieuFavoriUnifie } from "@/shared/types/lieu-favori.types";
import { getLieuFavoriIcon } from "@/shared/utils/lieu-favori-icon";

interface PassengerDashboardData {
  reservations: Reservation[];
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

export default function PassengerDashboardPage() {
  const appState = useAppState();
  const router = useRouter();
  const params = useParams();
  const isBelowLg = useIsMobileOrTablet();
  const user = appState.userConnected;
  const { setActiveLoader } = useLoader();
  const routeId = typeof params.id === "string" ? params.id : params.id?.[0];
  const userId = user?.id ?? "";

  const [dashData, setDashData] = useState<PassengerDashboardData | null>(null);
  const [favorites, setFavorites] = useState<LieuFavoriUnifie[]>([]);
  const [tips, setTips] = useState<Tip[]>([]);
  const [goTasks, setGoTasks] = useState<GoTask[]>([]);

  useEffect(() => {
    if (!user) {
      setActiveLoader(true);
      router.replace("/");
    } else if (
      user.id !== routeId ||
      user.role.toString().toLowerCase() !== "passenger"
    ) {
      setActiveLoader(true);
      router.replace(`/${user.role.toString().toLowerCase()}/${user.id}`);
    } else {
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [routeId, router, setActiveLoader, user]);

  const loadPassengerData = useCallback(async () => {
    if (!user) return;

    try {
      const [dashboardRes, favoritesRes, astucesRes, goTasksRes] = await Promise.all([
        fetch(`/api/dashboard/passenger/${user.id}`),
        fetch(`/api/lieux-favoris`, { credentials: 'same-origin' }),
        fetch("/api/astuces"),
        fetch("/api/gotasks"),
      ]);

      if (dashboardRes.ok) {
        setDashData(await dashboardRes.json());
      } else {
        console.error("[passenger/page] loadPassengerData - dashboardRes", dashboardRes.status, dashboardRes.statusText);
      }
      if (favoritesRes.ok) {
        const payload = await favoritesRes.json();
        setFavorites(Array.isArray(payload) ? payload : []);
      } else {
        console.error("[passenger/page] loadPassengerData - favoritesRes", favoritesRes.status, favoritesRes.statusText);
      }
      if (astucesRes.ok) {
        const payload = await astucesRes.json();
        setTips(Array.isArray(payload) ? payload : []);
      } else {
        console.error("[passenger/page] loadPassengerData - astucesRes", astucesRes.status, astucesRes.statusText);
      }
      if (goTasksRes.ok) {
        const payload = await goTasksRes.json();
        setGoTasks(Array.isArray(payload) ? payload : []);
      } else {
        console.error("[passenger/page] loadPassengerData - goTasksRes", goTasksRes.status, goTasksRes.statusText);
      }
    } catch (error) {
      console.error("[passenger/page] loadPassengerData", error);
    }
  }, [user]);


  useEffect(() => {
    // Vérifier si l'utilisateur est authentifié et a le rôle de passager
    if (!user || user.role.toString().toLowerCase() !== "passenger") return;
    // Vérifier que l'ID de route correspond à l'ID de l'utilisateur
    if (user.id !== routeId) return;
    
    // Charger les données du passager dans une IIFE asynchrone
    (async () => {
      await loadPassengerData();
    })();
  }, [loadPassengerData, routeId, user]);

  // SSE notifications temps réel
  useEffect(() => {
    if (!user) return;
    const es = new EventSource('/api/sse/notifications');

    es.addEventListener('notification', (event) => {
      try {
        const notif = JSON.parse(event.data);
        // Mapper le champ 'body' → 'message' (Server Core envoie 'body', frontend attend 'message')
        const mapped = {
          id:                   notif.id,
          userId:               notif.userId,
          title:                notif.title,
          type:                 notif.type?.toLowerCase().replace(/_/g, '-') ?? 'infos',
          message:              notif.body ?? notif.message ?? '',
          date:                 new Date(notif.createdAt).toISOString().slice(0, 10),
          time:                 new Date(notif.createdAt).toTimeString().slice(0, 5),
          isRead:               false,
          isImportant:          notif.isImportant ?? false,
          relatedTripId:        notif.relatedTripId ?? null,
          relatedReservationId: notif.relatedReservationId ?? null,
          createdAt:            notif.createdAt,
          link:                 notif.deepLink ?? null,
        };
        setDashData((prev) => prev
          ? { ...prev, notifications: [mapped, ...(prev.notifications ?? [])] }
          : prev
        );
      } catch { /* non bloquant */ }
    });

    es.addEventListener('error', () => {
      // SSE auto-reconnect natif du navigateur — pas d'action requise
    });

    return () => es.close();
  }, [user]);

  const handleCancelReservation = useCallback(async (reservationId: string, raison?: string) => {
    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(reservationId)}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-caller-id": userId },
        body: JSON.stringify({ raison }),
      });
      if (!res.ok) {
        console.error(`[passenger/page] handleCancelReservation - reservationId: ${reservationId} - response not ok`, res.status, res.statusText);
        return false;
      }
      await loadPassengerData();
      return true;
    } catch (error) {
      console.error(`[passenger/page] handleCancelReservation - reservationId: ${reservationId}`, error);
      return false;
    }
  }, [loadPassengerData, userId]);

  const handleStartReservation = useCallback(async (reservationId: string) => {
    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(reservationId)}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" 
          , "x-caller-id": userId
        },
      });
      if (!res.ok) {
        console.error(`[passenger/page] handleStartReservation - reservationId: ${reservationId} - response not ok`, res.status, res.statusText);
        return null;
      }
      const payload = await res.json();
      await loadPassengerData();
      return typeof payload.tripId === "string" ? payload.tripId : null;
    } catch (error) {
      console.error(`[passenger/page] handleStartReservation - reservationId: ${reservationId}`, error);
      return null;
    }
  }, [loadPassengerData, userId]);

  const handleDeleteFavorite = useCallback(async (favorite: LieuFavoriUnifie) => {
    try {
      const res = await fetch(`/api/lieux-favoris?id=${favorite.id}`, {
        method: "DELETE",
        credentials: 'same-origin',
      });
      if (!res.ok) {
        console.error(`[passenger/page] handleDeleteFavorite - id: ${favorite.id} - response not ok`, res.status, res.statusText);
        return;
      }
      setFavorites((prev) => prev.filter((item) => item.id !== favorite.id));
    } catch (error) {
      console.error(`[passenger/page] handleDeleteFavorite - id: ${favorite.id}`, error);
    }
  }, []);

  if (user?.id !== routeId || user?.role.toString().toLowerCase() !== "passenger") {
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
      <div className="flex flex-col mb-10 overflow-x-hidden">
        <Hero favDestinations={favDestinations} />
        {!isBelowLg ? (
          <main className="w-full h-full flex flex-col overflow-x-hidden overflow-y-visible bg-gray-100 px-6 py-5 xl:px-10">
            <div className="flex w-full h-fit items-start gap-6 mb-6">
              <div className="flex min-w-0 flex-1 flex-col gap-6 pr-1">
                <ReservationsSection
                  reservations={dashData?.reservations ?? []}
                  onCancelReservation={handleCancelReservation}
                  onStartReservation={handleStartReservation}
                  isLoading={!dashData}
                />
                <FavoritesSection
                  favorites={favorites}
                  onDeleteFavorite={handleDeleteFavorite}
                />
                <ReviewsSection reviews={dashData?.reviews ?? []} />
                {/* Section des destinations récentes et habituelles avec contraintes de largeur */}
                <div className="flex gap-6 w-full min-w-0">
                  <div className="flex-1 min-w-0">
                  <RecentsDestinationsSection isLoading={!dashData} />
                  </div>
                  <div className="flex-1 min-w-0">
                  <UsualDestinationsSection isLoading={!dashData} />
                  </div>
                </div>
                <RecommendedRidesSection isLoading={!dashData} />
              </div>
              <div className="flex w-full max-w-120 shrink-0 flex-col gap-6 pl-0 xl:w-2/7 xl:pl-5">
                <StatisticSection stats={dashData?.stats ?? DEFAULT_STATS} />
                <NotificationsSection notifications={dashData?.notifications ?? []} />
                <GoBoard currentScore={dashData?.stats?.goScore ?? 0} tasks={goTasks} />
                <LaCiteAstucesSection tips={tips} />
              </div>
            </div>
            <div className="px-10">
              <NouveautesSection />
            </div>
          </main>
        ) : (
          <main className="flex w-full max-w-full flex-col gap-y-5 overflow-x-hidden overflow-y-visible bg-gray-100 px-3 py-2 shadow-md">
            <ReservationsSection
              reservations={dashData?.reservations ?? []}
              onCancelReservation={handleCancelReservation}
              onStartReservation={handleStartReservation}
              isLoading={!dashData}
            />
            <NotificationsSection notifications={dashData?.notifications ?? []} />
            <StatisticSection stats={dashData?.stats ?? DEFAULT_STATS} />
            <FavoritesSection
              favorites={favorites}
              onDeleteFavorite={handleDeleteFavorite}
            />
            <ReviewsSection reviews={dashData?.reviews ?? []} />
            <GoBoard currentScore={dashData?.stats?.goScore ?? 0} tasks={goTasks} />
            <RecentsDestinationsSection isLoading={!dashData} />
            <UsualDestinationsSection isLoading={!dashData} />
            <RecommendedRidesSection isLoading={!dashData} />
            <LaCiteAstucesSection tips={tips} />
            <NouveautesSection />
          </main>
        )}
      </div>
    </DashboardProvider>
  );
}
