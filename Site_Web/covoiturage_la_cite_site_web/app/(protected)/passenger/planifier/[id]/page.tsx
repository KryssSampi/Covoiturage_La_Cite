"use client";

import { AnimatePresence, motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { FaCalendarDays } from "react-icons/fa6";

import { useDb } from "@/core/context/db.context";
import { useLoader } from "@/core/context/loader.context";
import type { IndisponibilityDateRange } from "@/core/models/IndisponibilityModel";
import { Language, useAppState } from "@/core/state/app_state";
import { isDashboardTripBlockedByIndisponibility } from "@/core/utils/indisponibility.utils";
import { tripModelToReservation } from "@/features/dashboard/converters/dashboard.converter";
import type { Reservation } from "@/features/dashboard/types";
import SuperCalendar from "@/features/planner/components/shared/calendar";
import { Hero } from "@/features/planner/components/shared/hero";
import { RideArea } from "@/features/planner/components/shared/rides.area";
import { PlannerFeatureProvider } from "@/features/planner/context/PlannerFeatureProvider";
import { useHeroSearchBar } from "@/features/planner/context/SearchBarContext";
import { tripsToTripWithCoords } from "@/features/search/converters/search.converter";

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
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;
  const { plannerSearchActive, plannerSearchValues, exitPlannerSearch } = useHeroSearchBar();
  const { trips, users, myIndisponibility } = useDb();

  // Scroll + refresh automatique vers la zone trajets si demandé par la page réservation
  useEffect(() => {
    const flag = sessionStorage.getItem('plannerScrollToRides');
    if (!flag) return;
    sessionStorage.removeItem('plannerScrollToRides');
    if (onRefresh) void onRefresh();
    const timer = setTimeout(() => {
      document.getElementById('planner-rides')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 700);
    return () => clearTimeout(timer);
  }, [onRefresh]);
  const usersMap = useMemo(() => new Map(users.map((u) => [u.id, u])), [users]);
  const availableTrips = useMemo(
    () =>
      tripsToTripWithCoords(trips, usersMap).filter(
        (trip) => !isDashboardTripBlockedByIndisponibility(trip, myIndisponibility),
      ),
    [trips, usersMap, myIndisponibility],
  );

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
            className="flex items-center gap-3 bg-white px-4 pt-4"
          >
            <button
              onClick={exitPlannerSearch}
              className="inline-flex items-center gap-2 rounded-lg bg-[#08316e] px-4 py-2 text-sm font-semibold text-white shadow transition-colors duration-200 hover:bg-[#0a4a9e]"
            >
              <FaCalendarDays size={14} />
              {isFR ? 'Retour au calendrier' : 'Back to calendar'}
            </button>
            <span className="text-sm text-gray-500">
              {plannerSearchValues?.departureLabel && plannerSearchValues?.arrivalLabel
                ? `${isFR ? 'Résultats' : 'Results'} : ${plannerSearchValues.departureLabel} ${isFR ? 'vers' : 'to'} ${plannerSearchValues.arrivalLabel}`
                : isFR
                  ? "Remplissez le formulaire ci-dessus pour rechercher un trajet"
                  : "Fill out the form above to search for a trip"}
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
              key={`${plannerSearchValues?.departureLabel}|${plannerSearchValues?.arrivalLabel}`}
              role="passenger"
              initialValues={plannerSearchValues ?? undefined}
              availableTrips={availableTrips}
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
  const params = useParams();
  const { setActiveLoader } = useLoader();
  const routeId = typeof params.id === "string" ? params.id : params.id?.[0];
  const userRole = userConnected?.role?.toString().toLowerCase();
  const {
    trips,
    reservations,
    users,
    myIndisponibility,
    refreshTrips,
    refreshReservations,
    refreshIndisponibilities,
  } = useDb();

  useEffect(() => {
    if (!userConnected) {
      setActiveLoader(true);
      router.replace("/");
      return;
    }

    if (userConnected.id !== routeId || userRole !== "passenger") {
      setActiveLoader(true);
      router.replace(`/${userRole}/planifier/${userConnected.id}`);
      return;
    }

    const timer = setTimeout(() => setActiveLoader(false), 300);
    return () => clearTimeout(timer);
  }, [routeId, router, setActiveLoader, userConnected, userRole]);

  const plannerRides = useMemo<Reservation[]>(() => {
    if (!userConnected) return [];

    return reservations
      .filter((reservation) => reservation.passengerId === userConnected.id)
      .map((reservation) => {
        const trip = trips.find((item) => item.id === reservation.tripId);
        const driver = trip ? users.find((item) => item.id === trip.driverId) : undefined;

        if (!trip || !driver) return null;

        return tripModelToReservation(trip, reservation, driver);
      })
      .filter(Boolean) as Reservation[];
  }, [reservations, trips, userConnected, users]);

  const handleCancelReservation = useCallback(async (reservationId: string, raison?: string) => {
    try {
      const response = await fetch(`/api/reservations/${encodeURIComponent(reservationId)}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" 
          , "x-caller-id": `${userConnected?.id}`
        },
        body: JSON.stringify({ raison }),
      });

      if (!response.ok) {
        console.error(
          `[passenger/planifier] handleCancelReservation - reservationId: ${reservationId} - response not ok`,
          response.status,
          response.statusText,
        );
        return false;
      }

      await Promise.all([refreshReservations(), refreshTrips()]);
      return true;
    } catch (error) {
      console.error(`[passenger/planifier] handleCancelReservation - reservationId: ${reservationId}`, error);
      return false;
    }
  }, [refreshReservations, refreshTrips, userConnected]);

  const handleStartReservation = useCallback(async (reservationId: string) => {
    try {
      const response = await fetch(`/api/reservations/${encodeURIComponent(reservationId)}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" ,
           "x-caller-id": `${userConnected?.id}`
        },
      });

      if (!response.ok) {
        console.error(
          `[passenger/planifier] handleStartReservation - reservationId: ${reservationId} - response not ok`,
          response.status,
          response.statusText,
        );
        return null;
      }

      const payload = await response.json();
      await Promise.all([refreshReservations(), refreshTrips()]);
      return typeof payload.tripId === "string" ? payload.tripId : null;
    } catch (error) {
      console.error(`[passenger/planifier] handleStartReservation - reservationId: ${reservationId}`, error);
      return null;
    }
  }, [refreshReservations, refreshTrips, userConnected]);

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
          `[passenger/planifier] handleSaveIndisponibilities - userId: ${userConnected.id} - response not ok`,
          response.status,
          response.statusText,
        );
        return;
      }

      await refreshIndisponibilities();
    } catch (error) {
      console.error(`[passenger/planifier] handleSaveIndisponibilities - userId: ${userConnected.id}`, error);
    }
  }, [refreshIndisponibilities, userConnected]);

  // Rafraîchit trips + réservations depuis la page (respecte la règle : aucun composant ne fetch)
  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([refreshTrips(), refreshReservations()]);
    } catch (error) {
      console.error("[passenger/planifier] handleRefresh", error);
    }
  }, [refreshTrips, refreshReservations]);

  if (userConnected?.id !== routeId || userRole !== "passenger") {
    return null;
  }

  return (
    <PlannerFeatureProvider
      lang={lang}
      isDriver={false}
      rides={plannerRides}
      indisponibilities={myIndisponibility?.dates ?? []}
      onSaveIndisponibilities={handleSaveIndisponibilities}
      onCancelReservation={handleCancelReservation}
      onStartReservation={handleStartReservation}
    >
      <PlannerContent onRefresh={handleRefresh} />
    </PlannerFeatureProvider>
  );
}
