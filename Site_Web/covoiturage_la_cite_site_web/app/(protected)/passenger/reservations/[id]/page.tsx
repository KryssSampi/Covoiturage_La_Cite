"use client";

/**
 * Page des réservations — rôle Passager.
 * Récupère les données via API, souscrit au polling pour les mises à jour,
 * et passe les items à PassengerReservationsPage (composant pur).
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { PassengerReservationsPage } from "@/features/reservations";
import type { Reservation } from "@/features/dashboard/types";

export default function PassengerReservationsRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;

  const [items, setItems] = useState<Reservation[]>([]);

  // Vérification rôle / identité
  useEffect(() => {
    if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") {
      setActiveLoader(true);
      router.push(`/${user?.role?.toString().toLowerCase()}/${user?.id}`);
    } else {
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [user, params, router, setActiveLoader]);

  // Chargement des données
  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/passenger/reservations-enriched');
      if (!res.ok) return;
      setItems(await res.json());
    } catch (error) {
      console.error("[passenger/reservations] loadData", error);
    }
  }, [user]);

  // Chargement initial — FIX: useEffect correctement déclaré
  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "passenger") return;
    if (user.id !== params.id) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadData();
  }, [loadData, params.id, user]);

  // Polling 30s
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    const interval = setInterval(() => { void loadData(); }, 30000);
    return () => clearInterval(interval);
  }, [user, params.id, loadData]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") return null;

  return <PassengerReservationsPage items={items} />;
}
