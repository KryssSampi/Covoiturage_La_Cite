"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { FaCalendarDays } from "react-icons/fa6";

import { useLoader } from "@/core/context/loader.context";
import type { IndisponibilityDateRange } from "@/core/models/IndisponibilityModel";
import type { UserModel } from "@/core/models/UserModel";
import { useAppState } from "@/core/state/app_state";
import { tripModelToPublishedTrip } from "@/features/dashboard/converters/dashboard.converter";
import type { PublishedTrip } from "@/features/dashboard/types";
import SuperCalendar from "@/features/planner/components/shared/calendar";
import { Hero } from "@/features/planner/components/shared/hero";
import { RideArea } from "@/features/planner/components/shared/rides.area";
import { PlannerFeatureProvider } from "@/features/planner/context/PlannerFeatureProvider";
import { useHeroSearchBar } from "@/features/planner/context/SearchBarContext";

const RouteMapSearch = dynamic(
  () => import("@/features/search/components/shared/RouteMapSearch").then((m) => m.RouteMapSearch),
  { ssr: false },
);

const calendarVariants = {
  initial: { opacity: 0, y: -48, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 56, scale: 0.97 },
};

const mapVariants = {
  initial: { opacity: 0, y: 56, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -48, scale: 0.97 },
};

const transition = { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] };

function PlannerContent({ onRefresh }: { onRefresh?: () => Promise<void> }) {
  const { plannerSearchActive, plannerSearchValues, pendingDateTime, exitPlannerSearch } = useHeroSearchBar();
  const searchParams = useSearchParams();
  const newTripId    = searchParams.get("newTripId");

  // Scroll vers la ride area quand un nouveau trajet vient d'être créé.
  // On utilise le param URL (pas sessionStorage) pour être robuste en React Strict Mode.
  useEffect(() => {
    if (!newTripId) return;
    const timer = setTimeout(() => {
      document.getElementById("planner-rides")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 800);
    return () => clearTimeout(timer);
  }, [newTripId]);

  return (
    <div className="mb-10 flex h-full flex-col bg-white">
      <Hero />

      <AnimatePresence>
        {plannerSearchActive && (
          <motion.div
            key="back-btn"
            initial={{ opacity: 0, x: -28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -28 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="flex items-center gap-3 px-4 pt-4"
          >
            <button
              onClick={exitPlannerSearch}
              className="inline-flex items-center gap-2 rounded-lg bg-[#08316e] px-4 py-2 text-sm font-semibold text-white shadow transition-colors duration-200 hover:bg-[#0a4a9e]"
            >
              <FaCalendarDays size={14} />
              {"Retour au calendrier"}
            </button>
            <span className="text-sm text-gray-500">
              {plannerSearchValues?.departureLabel && plannerSearchValues?.arrivalLabel
                ? `Resultats : ${plannerSearchValues.departureLabel} vers ${plannerSearchValues.arrivalLabel}`
                : "Remplissez le formulaire ci-dessus pour rechercher un circuit"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {plannerSearchActive ? (
          <motion.div
            key="route-map"
            variants={mapVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
            className="px-4 pt-2 pb-6"
          >
            <RouteMapSearch
              role="driver"
              initialValues={plannerSearchValues ?? undefined}
              pendingDateTime={pendingDateTime}
            />
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            variants={calendarVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={transition}
          >
            <SuperCalendar />
          </motion.div>
        )}
      </AnimatePresence>

      <div id="planner-rides">
        <RideArea onRefresh={onRefresh} />
      </div>
    </div>
  );
}

export default function PlannerPage() {
  const { lang, userConnected } = useAppState();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { setActiveLoader } = useLoader();
  const routeId = typeof params.id === "string" ? params.id : params.id?.[0];
  const userRole = userConnected?.role?.toString().toLowerCase();
  // DbProvider supprimé — les données viennent des appels fetch directs
  const trips: import("@/core/models/TripModel").TripModel[] = [];
  const reservations: import("@/core/models/ReservationModel").ReservationModel[] = [];
  const users: import("@/core/models/UserModel").UserModel[] = [];
  const myIndisponibility = null;
  const refreshTrips = async () => {};
  const refreshReservations = async () => {};
  const refreshIndisponibilities = async () => {};
  const newTripId = searchParams.get("newTripId");

  useEffect(() => {
    if (!userConnected) {
      setActiveLoader(true);
      router.replace("/");
      return;
    }

    if (userConnected.id !== routeId || userRole !== "driver") {
      setActiveLoader(true);
      router.replace(`/${userRole}/planifier/${userConnected.id}`);
      return;
    }

    const timer = setTimeout(() => setActiveLoader(false), 300);
    return () => clearTimeout(timer);
  }, [routeId, router, setActiveLoader, userConnected, userRole]);

  useEffect(() => {
    if (!newTripId || !userConnected?.id) return;

    void Promise.all([refreshTrips(), refreshReservations()]).catch((error) => {
      console.error("[driver/planifier] refresh after newTripId", error);
    });
  }, [newTripId, refreshReservations, refreshTrips, userConnected?.id]);

  const plannerRides = useMemo<PublishedTrip[]>(() => {
    if (!userConnected) return [];

    return trips
      .filter((trip) => trip.driverId === userConnected.id)
      .map((trip) => {
        const tripReservations = reservations.filter((reservation) => reservation.tripId === trip.id);
        const passengers = tripReservations
          .filter((reservation) => reservation.status === "confirmed" || reservation.status === "completed")
          .map((reservation) => users.find((user) => user.id === reservation.passengerId))
          .filter(Boolean);

        const pendingCount = tripReservations.filter((reservation) => reservation.status === "pending").length;

        return tripModelToPublishedTrip(trip, passengers as UserModel[], pendingCount);
      });
  }, [reservations, trips, userConnected, users]);

  const handleStartTrip = useCallback(async (tripId: string) => {
    try {
      const res = await fetch(`/api/trips/${encodeURIComponent(tripId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      if (!res.ok) {
        console.error(`[driver/planifier] handleStartTrip - tripId: ${tripId} - response not ok`, res.status, res.statusText);
        return;
      }
      await Promise.all([refreshTrips(), refreshReservations()]);
      router.push(`/trajet-en-cours/${tripId}`);
    } catch (error) {
      console.error(`[driver/planifier] handleStartTrip - tripId: ${tripId}`, error);
    }
  }, [refreshTrips, refreshReservations, router]);

  const handleCancelTrip = useCallback(async (tripId: string) => {
    try {
      const response = await fetch(`/api/trips/${encodeURIComponent(tripId)}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });

      if (!response.ok) {
        console.error(`[driver/planifier] handleCancelTrip - tripId: ${tripId} - response not ok`, response.status, response.statusText);
        return false;
      }

      await Promise.all([refreshTrips(), refreshReservations()]);
      return true;
    } catch (error) {
      console.error(`[driver/planifier] handleCancelTrip - tripId: ${tripId}`, error);
      return false;
    }
  }, [refreshReservations, refreshTrips]);

  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([refreshTrips(), refreshReservations()]);
    } catch (error) {
      console.error("[driver/planifier] handleRefresh", error);
    }
  }, [refreshTrips, refreshReservations]);

  // Gère la sauvegarde des périodes d'indisponibilité du conducteur
  const handleSaveIndisponibilities = useCallback(async (dates: IndisponibilityDateRange[]) => {
    if (!userConnected?.id) return;

    try {
      const response = await fetch(`/api/indisponibilities/${encodeURIComponent(userConnected.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dates }),
      });

      if (!response.ok) {
        console.error(
          `[driver/planifier] handleSaveIndisponibilities - userId: ${userConnected.id} - response not ok`,
          response.status,
          response.statusText,
        );
        return;
      }

      await refreshIndisponibilities();
    } catch (error) {
      console.error(`[driver/planifier] handleSaveIndisponibilities - userId: ${userConnected.id}`, error);
    }
  }, [refreshIndisponibilities, userConnected]);

  if (userConnected?.id !== routeId || userRole !== "driver") {
    return null;
  }

  return (
    <PlannerFeatureProvider
      lang={lang}
      isDriver
      rides={plannerRides}
      indisponibilities={myIndisponibility?.dates ?? []}
      onSaveIndisponibilities={handleSaveIndisponibilities}
      onCancelTrip={handleCancelTrip}
      onStartTrip={handleStartTrip}
    >
      <PlannerContent onRefresh={handleRefresh} />
    </PlannerFeatureProvider>
  );
}
