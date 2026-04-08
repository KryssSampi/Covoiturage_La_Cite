"use client";

/**
 * Page des demandes de réservation — rôle Conducteur.
 * Récupère les données via API, souscrit au SSE pour les mises à jour temps réel,
 * et passe les items + handlers à DriverReservationsPage (composant pur).
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { DriverReservationsPage } from "@/features/reservations";
import type { ReservationRequest } from "@/features/dashboard/types";

export default function DriverReservationsRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

  const [items, setItems] = useState<ReservationRequest[]>([]);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Vérification rôle / identité
  useEffect(() => {
    if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "driver") {
      setActiveLoader(true);
      router.push(`/${user?.role?.toString().toLowerCase()}/${user?.id}`);
    } else {
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [user, params, router, setActiveLoader]);

  // Chargement des données depuis l'API dédiée (montage backend)
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/driver/reservation-requests?driverId=${encodeURIComponent(user.id)}`);
      if (!res.ok) return;
      setItems(await res.json());
    } catch (error) {
      console.error("[driver/reservations] loadData", error);
    }
  }, [user]);

  // Chargement initial
  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "driver") return;
    if (user.id !== params.id) return;
    void loadData();
  }, [loadData, params.id, user]);

  // SSE : mise à jour temps réel lorsque les réservations changent
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    // SSE endpoint /api/sse/db-watch/* is deprecated and returns 503.
    // Use a light polling fallback to avoid calling the disabled SSE route.
    const interval = setInterval(() => {
      void loadData();
    }, 30000); // 30s
    return () => clearInterval(interval);
  }, [user, params.id, loadData]);

  // Accepter une demande de réservation
  const handleAcceptRequest = useCallback(async (id: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(id)}/accept`, { method: "POST",
        headers: { "x-caller-id": `${user?.id}` }
       });
      if (!res.ok) return false;
      await loadData();
      return true;
    } catch (err) {
      console.error("[driver/reservations/page]", err);
      return false;
    } finally {
      setIsActionLoading(false);
    }
  }, [loadData, user?.id]);

  // Refuser une demande de réservation
  const handleRejectRequest = useCallback(async (id: string) => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`/api/reservations/${encodeURIComponent(id)}/reject`, { method: "POST",
        headers: { "x-caller-id": `${user?.id}` }
      });
      if (!res.ok) return false;
      await loadData();
      return true;
    } catch (err) {
      console.error("[driver/reservations/page]", err);
      return false;
    } finally {
      setIsActionLoading(false);
    }
  }, [loadData, user?.id]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "driver") return null;

  return (
    <DriverReservationsPage
      items={items}
      onAcceptRequest={handleAcceptRequest}
      onRejectRequest={handleRejectRequest}
      isActionLoading={isActionLoading}
    />
  );
}
