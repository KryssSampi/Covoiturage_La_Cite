"use client";

/**
 * @file page.tsx — app/(protected)/driver/search/[id]/page.tsx
 */

import { useEffect }                              from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useLoader }                             from "@/core/context/loader.context";
import { useAppState }                           from "@/core/state/app_state";
import { RouteMapSearch }                        from "@/features/search/components/shared/RouteMapSearch";

export default function DriverSearchPage() {
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
      user?.role?.toString().toLowerCase() !== "driver"
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
    user?.role?.toString().toLowerCase() !== "driver"
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
      role="driver"
      initialValues={initialValues}
    />
  );
}

