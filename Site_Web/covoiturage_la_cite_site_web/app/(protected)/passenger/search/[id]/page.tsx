"use client";

/**
 * @file page.tsx — app/(protected)/passenger/search/[id]/page.tsx
 *
 * La page fait le fetch : POST /api/passenger/search
 * Le backend exécute le matching v4 côté serveur et renvoie des TripSearchDTO
 * (sans données sensibles). Le converter transforme les DTOs en TripWithCoords
 * pour RouteMapSearch.
 */

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useParams, useSearchParams, useRouter }     from "next/navigation";
import { useLoader }                                 from "@/core/context/loader.context";
import { useAppState }                               from "@/core/state/app_state";
import { tripSearchDTOToTripWithCoords }             from "@/features/search/converters/search.converter";
import { RouteMapSearch }                            from "@/features/search/components/shared/RouteMapSearch";
import { ReservationRequestToast }                   from "@/features/reservation/components/ReservationRequestToast";
import type { TripWithCoords }                       from "@/features/search/types/search.feature.types";
import type { TripSearchDTO }                        from "@/features/search/utils/matchingV4";

/** Statuts actifs — une réservation dans ces états bloque une nouvelle demande */
const ACTIVE_RESERVATION_STATUSES = ["pending", "confirmed", "in_progress"];

export default function PassengerSearchPage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const searchParams        = useSearchParams();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;
  const [, startTransition] = useTransition();

  const [availableTrips, setAvailableTrips] = useState<TripWithCoords[]>([]);
  const [blockedTrips, setBlockedTrips] = useState<TripWithCoords[]>([]);
  const [serverScoresMap, setServerScoresMap] = useState<Map<string, number>>(new Map());
  // Ref pour éviter les appels en cascade lors du changement de dépendances
  const hasFetchedRef = useRef(false);

  // Carte tripId → statut de la réservation active du passager connecté
  const [userReservations, setUserReservations] = useState<Map<string, string>>(new Map());

  // État du toast de confirmation de réservation
  const [reservationToast, setReservationToast] = useState<{
    isOpen: boolean;
    success: boolean;
    message: string;
  }>({ isOpen: false, success: false, message: "" });

  // Coordonnées issues des searchParams ([lng, lat] côté UI, [lat, lng] attendu par l'API)
  const depLat = searchParams.get("depLat");
  const depLng = searchParams.get("depLng");
  const arrLat = searchParams.get("arrLat");
  const arrLng = searchParams.get("arrLng");
  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");

  // Charge les réservations actives du passager connecté pour chaque trip
  const fetchUserReservations = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await fetch(`/api/reservations?passengerId=${encodeURIComponent(user.id)}`);
      if (!res.ok) return;
      const data = await res.json() as Array<Record<string, unknown>>;
      const map = new Map<string, string>();
      for (const r of data) {
        if (
          typeof r.tripId === "string" &&
          typeof r.status === "string" &&
          ACTIVE_RESERVATION_STATUSES.includes(r.status)
        ) {
          map.set(r.tripId, r.status);
        }
      }
      setUserReservations(map);
    } catch (err) { console.error('[passenger/search] fetchUserReservations', err); }
  }, [user]);

  // Handler du bouton OK du toast — redirige vers planifier et scrolle vers ride area
  const handleToastOk = useCallback(() => {
    const wasSuccess = reservationToast.success;
    setReservationToast((prev) => ({ ...prev, isOpen: false }));
    if (wasSuccess && user?.id) {
      try { sessionStorage.setItem("plannerScrollToRides", "1"); } catch { /* sstorage indisponible */ }
      router.push(`/passenger/planifier/${user.id}?showAll=true`);
    }
  }, [reservationToast.success, user, router]);

  const fetchTrips = useCallback(async (search?: {
    departureCoords?: [number, number];
    arrivalCoords?: [number, number];
    departureDate?: string;
    departureTime?: string;
    maxPrice?: number;
    minSeatsAvailable?: number;
    departureRadiusMeters?: number;
    arrivalRadiusMeters?: number;
  }) => {
    if (!user?.id) return;

    // Mode survey : trips pré-calculés en sessionStorage → on les utilise directement
    try {
      const raw = sessionStorage.getItem("surveyMatchingTrips");
      sessionStorage.removeItem("surveyMatchingTrips");
      if (raw) {
        const parsed: TripWithCoords[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailableTrips(parsed);
          setBlockedTrips([]);
          setServerScoresMap(new Map());
          return; // only short-circuit when we actually have data
        }
      }
    } catch { /* sessionStorage indisponible ou JSON invalide */ }

    // Fetch côté serveur : matching v4, données sensibles masquées côté serveur
    try {
      const body: Record<string, unknown> = { passengerId: user.id };
      const effectiveDepartureCoords = search?.departureCoords
        ?? (depLat && depLng ? [parseFloat(depLat), parseFloat(depLng)] as [number, number] : undefined);
      const effectiveArrivalCoords = search?.arrivalCoords
        ?? (arrLat && arrLng ? [parseFloat(arrLat), parseFloat(arrLng)] as [number, number] : undefined);
      const effectiveDate = search?.departureDate ?? dateParam ?? undefined;
      const effectiveTime = search?.departureTime ?? timeParam ?? undefined;

      if (effectiveDepartureCoords) body.departureCoords = effectiveDepartureCoords;
      if (effectiveArrivalCoords) body.arrivalCoords   = effectiveArrivalCoords;
      if (effectiveTime) {
        const [h, m] = effectiveTime.split(":").map(Number);
        body.desiredHour = h + (m ?? 0) / 60;
      }
      if (effectiveDate) {
        body.date = effectiveDate; // filtre exact sur la date
        const day = new Date(effectiveDate).getDay(); // 0=dim … 6=sam
        body.desiredWeekday = day;
      }

      // Filtres côté serveur (matching v4)
      if (search?.maxPrice != null) body.maxPrice = search.maxPrice;
      if (search?.minSeatsAvailable != null) body.minSeatsAvailable = search.minSeatsAvailable;
      if (search?.departureRadiusMeters != null) body.departureRadiusMeters = search.departureRadiusMeters;
      if (search?.arrivalRadiusMeters != null) body.arrivalRadiusMeters = search.arrivalRadiusMeters;

      const res = await fetch('/api/passenger/search', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (!res.ok) return;

      const data = await res.json() as {
        trips?: TripSearchDTO[];
        blockedTrips?: TripSearchDTO[];
        serverScores?: Record<string, number>;
      };
      setAvailableTrips((data.trips ?? []).map(tripSearchDTOToTripWithCoords));
      setBlockedTrips((data.blockedTrips ?? []).map(tripSearchDTOToTripWithCoords));
      if (data.serverScores) setServerScoresMap(new Map(Object.entries(data.serverScores)));
      else setServerScoresMap(new Map());
    } catch (err) { console.error('[passenger/search] fetchTrips', err); }
  }, [user, depLat, depLng, arrLat, arrLng, dateParam, timeParam]);

  // Déclenche le fetch une seule fois au montage du composant
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      startTransition(() => {
        fetchTrips();
      });
      // On utilise une fonction asynchrone pour éviter un setState synchrone dans l'effet
      (async () => {
        await fetchUserReservations();
      })();
    }
  }, [fetchUserReservations, fetchTrips, startTransition]);

  // ── Guard : vérification rôle / identité ─────────────────────────────────
  useEffect(() => {
    if (
      user?.id !== params.id ||
      user?.role?.toString().toLowerCase() !== "passenger"
    ) {
      setActiveLoader(true);
      router.push(`/${user?.role?.toString().toLowerCase()}/${user?.id}`);
    } else {
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [user, params, router, setActiveLoader]);

  if (
    user?.id !== params.id ||
    user?.role?.toString().toLowerCase() !== "passenger"
  ) return null;

  // On ajoute la date et l'heure pour préremplir les pickers
  const initialValues = {
    departureLabel:  searchParams.get("dep") ?? undefined,
    arrivalLabel:    searchParams.get("arr") ?? undefined,
    departureCoords: depLng && depLat
      ? [parseFloat(depLng), parseFloat(depLat)] as [number, number]
      : undefined,
    arrivalCoords: arrLng && arrLat
      ? [parseFloat(arrLng), parseFloat(arrLat)] as [number, number]
      : undefined,
    departureDate: dateParam ?? undefined, // Ajout date
    departureTime: timeParam ?? undefined, // Ajout heure
  };

  return (
    <>
      <RouteMapSearch
        role="passenger"
        initialValues={initialValues}
        availableTrips={availableTrips}
        blockedTrips={blockedTrips}
        serverScores={serverScoresMap}
        userReservations={userReservations}
        onPassengerSearch={async ({ departureCoords, arrivalCoords, departureDate, departureTime, maxPrice, minSeatsAvailable, departureRadiusMeters, arrivalRadiusMeters }) => {
          await fetchTrips({
            departureCoords: [departureCoords[1], departureCoords[0]],
            arrivalCoords: [arrivalCoords[1], arrivalCoords[0]],
            departureDate,
            departureTime,
            maxPrice,
            minSeatsAvailable,
            departureRadiusMeters,
            arrivalRadiusMeters,
          });
        }}
        onRefresh={() => { fetchTrips(); }}
      />
      <ReservationRequestToast
        isOpen={reservationToast.isOpen}
        success={reservationToast.success}
        message={reservationToast.message}
        onOk={handleToastOk}
      />
    </>
  );
}
