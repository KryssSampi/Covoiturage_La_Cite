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
import type { TripWithCoords }                       from "@/features/search/types/search.feature.types";
import type { TripSearchDTO }                        from "@/features/search/utils/matchingV4";

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
  // Ref pour éviter les appels en cascade lors du changement de dépendances
  const hasFetchedRef = useRef(false);

  // Coordonnées issues des searchParams ([lng, lat] côté UI, [lat, lng] attendu par l'API)
  const depLat = searchParams.get("depLat");
  const depLng = searchParams.get("depLng");
  const arrLat = searchParams.get("arrLat");
  const arrLng = searchParams.get("arrLng");
  const dateParam = searchParams.get("date");
  const timeParam = searchParams.get("time");

  const fetchTrips = useCallback(async (search?: {
    departureCoords?: [number, number];
    arrivalCoords?: [number, number];
    departureDate?: string;
    departureTime?: string;
  }) => {
    if (!user?.id) return;

    // Mode survey : trips pré-calculés en sessionStorage → on les utilise directement
    try {
      const raw = sessionStorage.getItem("surveyMatchingTrips");
      if (raw) {
        const parsed: TripWithCoords[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setAvailableTrips(parsed);
          setBlockedTrips([]);
        }
        sessionStorage.removeItem("surveyMatchingTrips");
        return;
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
        const day = new Date(effectiveDate).getDay(); // 0=dim … 6=sam
        body.desiredWeekday = day;
      }

      const res = await fetch('/api/passenger/search', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });

      if (!res.ok) return;

      const data = await res.json() as { trips: TripSearchDTO[]; blockedTrips?: TripSearchDTO[] };
      setAvailableTrips(data.trips.map(tripSearchDTOToTripWithCoords));
      setBlockedTrips((data.blockedTrips ?? []).map(tripSearchDTOToTripWithCoords));
    } catch { /* erreur réseau silencieuse */ }
  }, [user, depLat, depLng, arrLat, arrLng, dateParam, timeParam]);

  // Déclenche le fetch une seule fois au montage du composant
  useEffect(() => {
    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      // Wrapper l'appel fetchTrips() dans startTransition pour éviter les rendus en cascade
      startTransition(() => {
        fetchTrips();
      });
    }
  }, [startTransition, fetchTrips]);

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

  const initialValues = {
    departureLabel:  searchParams.get("dep") ?? undefined,
    arrivalLabel:    searchParams.get("arr") ?? undefined,
    departureCoords: depLng && depLat
      ? [parseFloat(depLng), parseFloat(depLat)] as [number, number]
      : undefined,
    arrivalCoords: arrLng && arrLat
      ? [parseFloat(arrLng), parseFloat(arrLat)] as [number, number]
      : undefined,
  };

  return (
    <RouteMapSearch
      role="passenger"
      initialValues={initialValues}
      availableTrips={availableTrips}
      blockedTrips={blockedTrips}
      onPassengerSearch={async ({ departureCoords, arrivalCoords, departureDate, departureTime }) => {
        await fetchTrips({
          departureCoords: [departureCoords[1], departureCoords[0]],
          arrivalCoords: [arrivalCoords[1], arrivalCoords[0]],
          departureDate,
          departureTime,
        });
      }}
    />
  );
}
