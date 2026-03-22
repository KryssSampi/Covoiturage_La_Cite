"use client";

/**
 * @file page.tsx — app/(protected)/passenger/search/[id]/page.tsx
 *
 * Charge les trajets publiés depuis la base de données statique (useDb)
 * et les injecte dans RouteMapSearch via le convertisseur search.converter.
 */

import { useEffect, useMemo, useState }          from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useLoader }                             from "@/core/context/loader.context";
import { useAppState }                           from "@/core/state/app_state";
import { useDb }                                 from "@/core/context/db.context";
import { tripsToTripWithCoords }                 from "@/features/search/converters/search.converter";
import { RouteMapSearch }                        from "@/features/search/components/shared/RouteMapSearch";
import type { TripWithCoords }                   from "@/features/search/types/search.feature.types";

export default function PassengerSearchPage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const searchParams        = useSearchParams();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

  // Récupération des trajets réels depuis la base de données statique
  const { trips, users } = useDb();

  // Map utilisateurs pour les convertisseurs
  const usersMap = useMemo(
    () => new Map(users.map((u) => [u.id, u])),
    [users]
  );

  // Conversion des TripModel en TripWithCoords (format RouteMapSearch)
  const convertedTrips = useMemo(
    () => tripsToTripWithCoords(trips, usersMap),
    [trips, usersMap]
  );

  // Mode survey : si des matching trips pré-calculés sont en sessionStorage,
  // on les utilise à la place des trips réels (pas de recherche live)
  const [availableTrips, setAvailableTrips] = useState<TripWithCoords[]>([]);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("surveyMatchingTrips");
      if (raw) {
        const parsed: TripWithCoords[] = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setAvailableTrips(parsed);
        sessionStorage.removeItem("surveyMatchingTrips");
      } else {
        // Mise à jour si les trips réels ont changé (ex: après création)
        setAvailableTrips(convertedTrips);
      }
    } catch { /* sessionStorage indisponible ou JSON invalide */ }
  }, [convertedTrips]);

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
    departureLabel:  searchParams.get("dep")    ?? undefined,
    arrivalLabel:    searchParams.get("arr")    ?? undefined,
    departureCoords: searchParams.get("depLng") && searchParams.get("depLat")
      ? [parseFloat(searchParams.get("depLng")!), parseFloat(searchParams.get("depLat")!)] as [number, number]
      : undefined,
    arrivalCoords:   searchParams.get("arrLng") && searchParams.get("arrLat")
      ? [parseFloat(searchParams.get("arrLng")!), parseFloat(searchParams.get("arrLat")!)] as [number, number]
      : undefined,
  };

  return (
    <RouteMapSearch
      role="passenger"
      initialValues={initialValues}
      availableTrips={availableTrips}
    />
  );
}
