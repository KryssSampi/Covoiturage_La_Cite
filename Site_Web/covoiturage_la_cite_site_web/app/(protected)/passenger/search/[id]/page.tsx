"use client";

/**
 * @file app/(protected)/passenger/search/[id]/page.tsx
 * Page de recherche de trajets — rôle Passager.
 *
 * Responsabilités :
 *   1. Guard : vérification rôle/identité
 *   2. Fetch initial (trajets disponibles + réservations actives du passager)
 *   3. Callback onPassengerSearch → appel POST /api/passenger/search
 *   4. Propagation des données à RouteMapSearch
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppState } from "@/core/state/app_state";
import { useLoader } from "@/core/context/loader.context";
import { RouteMapSearch } from "@/features/search/components/shared/RouteMapSearch";
import { tripSearchDTOToTripWithCoords } from "@/features/search/converters/search.converter";
import type { TripWithCoords } from "@/features/search/types/search.feature.types";
import type { Trip } from "@/features/dashboard/types/trip.types";

// ─── Types internes ───────────────────────────────────────────────────────────

interface SearchApiResponse {
  trips: Record<string, unknown>[];
  blockedTrips: Record<string, unknown>[];
  serverScores: Record<string, number>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PassengerSearchPage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const searchParams        = useSearchParams();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

  const [trips,            setTrips]           = useState<Trip[]>([]);
  const [blockedTrips,     setBlockedTrips]     = useState<TripWithCoords[]>([]);
  const [serverScores,     setServerScores]     = useState<Map<string, number>>(new Map());
  const [userReservations, setUserReservations] = useState<Map<string, string>>(new Map());

  // Gardez les derniers paramètres pour le rafraîchissement
  const lastSearchParams = useRef<Parameters<typeof handlePassengerSearch>[0] | null>(null);

  // ── Guard ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const role = user?.role?.toString().toLowerCase();
    if (user?.id !== params.id || role !== "passenger") {
      setActiveLoader(true);
      router.push(`/${role}/${user?.id}`);
    } else {
      const t = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(t);
    }
  }, [user, params, router, setActiveLoader]);

  // ── Charge les réservations actives du passager ───────────────────────────
  const loadReservations = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/reservations?passengerId=${encodeURIComponent(user.id)}&status=pending,confirmed,in_progress`);
      if (!res.ok) return;
      const json = await res.json();
      const data: Array<{ tripId?: string; status?: string }> = Array.isArray(json)
        ? json
        : (json.data ?? json.items ?? []);
      const map = new Map<string, string>();
      data.forEach((r) => { if (r.tripId && r.status) map.set(r.tripId, r.status); });
      setUserReservations(map);
    } catch { /* silencieux */ }
  }, [user]);

  // ── Recherche passager via Server Core (matching v4) ──────────────────────
  const handlePassengerSearch = useCallback(async (p: {
    departureCoords:      [number, number];
    arrivalCoords:        [number, number];
    departureDate?:       string;
    departureTime?:       string;
    maxPrice?:            number;
    minSeatsAvailable?:   number;
    departureRadiusMeters?: number;
    arrivalRadiusMeters?:   number;
  }) => {
    lastSearchParams.current = p;
    try {
      const body = {
        passengerId:          user?.id ?? "",
        departureCoords:      p.departureCoords,
        arrivalCoords:        p.arrivalCoords,
        date:                 p.departureDate,
        desiredHour:          p.departureTime
          ? (() => { const [h, m] = p.departureTime!.split(":").map(Number); return h + m / 60; })()
          : undefined,
        maxPrice:             p.maxPrice,
        minSeatsAvailable:    p.minSeatsAvailable ?? 1,
        departureRadiusMeters: p.departureRadiusMeters ?? 1000,
        arrivalRadiusMeters:   p.arrivalRadiusMeters   ?? 1000,
      };

      const res = await fetch("/api/passenger/search", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });

      if (!res.ok) return;
      const json: SearchApiResponse = await res.json();

      // Conversion DTO → TripWithCoords
      const converted = (json.trips ?? []).map((dto) =>
        tripSearchDTOToTripWithCoords(dto as unknown as Parameters<typeof tripSearchDTOToTripWithCoords>[0])
      );
      const convertedBlocked = (json.blockedTrips ?? []).map((dto) =>
        tripSearchDTOToTripWithCoords(dto as unknown as Parameters<typeof tripSearchDTOToTripWithCoords>[0])
      );

      setTrips(converted as unknown as Trip[]);
      setBlockedTrips(convertedBlocked);
      setServerScores(new Map(Object.entries(json.serverScores ?? {})));

      // Rafraîchit les réservations en parallèle
      void loadReservations();
    } catch (err) {
      console.error("[passenger/search] handlePassengerSearch", err);
    }
  }, [user, loadReservations]);

  // ── Rafraîchissement (même paramètres) ───────────────────────────────────
  const handleRefresh = useCallback(() => {
    if (lastSearchParams.current) {
      void handlePassengerSearch(lastSearchParams.current);
    }
  }, [handlePassengerSearch]);

  // ── Chargement initial si params dans l'URL ───────────────────────────────
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadReservations();

    const depLat = searchParams.get("depLat");
    const depLng = searchParams.get("depLng");
    const arrLat = searchParams.get("arrLat");
    const arrLng = searchParams.get("arrLng");

    if (depLat && depLng && arrLat && arrLng) {
      void handlePassengerSearch({
        departureCoords: [parseFloat(depLng), parseFloat(depLat)],
        arrivalCoords:   [parseFloat(arrLng), parseFloat(arrLat)],
        departureDate:   searchParams.get("date")        ?? undefined,
        departureTime:   searchParams.get("time")        ?? undefined,
      });
    }
  }, [user, params.id, searchParams, loadReservations, handlePassengerSearch]);

  if (!user || user.id !== params.id || user.role?.toString().toLowerCase() !== "passenger") {
    return null;
  }

  // Valeurs initiales pour pré-remplir la barre de recherche
  const initialValues = {
    departureLabel:  searchParams.get("dep")    ?? undefined,
    arrivalLabel:    searchParams.get("arr")    ?? undefined,
    departureCoords: searchParams.get("depLng") && searchParams.get("depLat")
      ? [parseFloat(searchParams.get("depLng")!), parseFloat(searchParams.get("depLat")!)] as [number, number]
      : undefined,
    arrivalCoords: searchParams.get("arrLng") && searchParams.get("arrLat")
      ? [parseFloat(searchParams.get("arrLng")!), parseFloat(searchParams.get("arrLat")!)] as [number, number]
      : undefined,
    departureDate: searchParams.get("date") ?? undefined,
    departureTime: searchParams.get("time") ?? undefined,
  };

  return (
    <RouteMapSearch
      role="passenger"
      initialValues={initialValues}
      availableTrips={trips}
      blockedTrips={blockedTrips}
      serverScores={serverScores}
      userReservations={userReservations}
      onPassengerSearch={handlePassengerSearch}
      onRefresh={handleRefresh}
    />
  );
}
