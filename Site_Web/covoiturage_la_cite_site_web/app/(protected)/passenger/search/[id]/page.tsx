"use client";

/**
 * @file page.tsx — app/(protected)/passenger/search/[id]/page.tsx
 *
 * Injecte les fixtures de trajets dans RouteMapSearch.
 * En production, remplacer ALL_SEARCH_TRIPS par un appel API réel.
 */

import { useEffect }                              from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useLoader }                             from "@/core/context/loader.context";
import { useAppState }                           from "@/core/state/app_state";
import { RouteMapSearch }                        from "@/features/search/components/shared/RouteMapSearch";
import ALL_SEARCH_TRIPS                          from "@/tests/fixtures/search/search_trips.fixtures";

export default function PassengerSearchPage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const searchParams        = useSearchParams();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

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

  // TODO : remplacer ALL_SEARCH_TRIPS par un appel API réel
  return (
    <RouteMapSearch
      role="passenger"
      initialValues={initialValues}
      availableTrips={ALL_SEARCH_TRIPS}
    />
  );
}
