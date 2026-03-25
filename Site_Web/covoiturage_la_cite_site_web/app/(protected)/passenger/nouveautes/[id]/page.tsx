"use client";

/**
 * Page des nouveautés — rôle Passager.
 * Récupère les données via API, souscrit au SSE pour les mises à jour temps réel,
 * et passe les items à NouveautesPage (composant pur).
 */

import { useEffect, useCallback, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { NouveautesPage } from "@/features/nouveautes";
import type { NouveauteModel } from "@/core/models/NouveauteModel";

export default function PassengerNouveautesRoutePage() {
  const appState            = useAppState();
  const params              = useParams<{ id: string }>();
  const router              = useRouter();
  const { setActiveLoader } = useLoader();
  const user                = appState.userConnected;
  const [items, setItems]   = useState<NouveauteModel[]>([]);

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

  // Chargement des nouveautés depuis l'API
  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/nouveautes");
      if (!res.ok) return;
      const data: NouveauteModel[] = await res.json();
      setItems(data);
    } catch (error) {
      console.error("[passenger/nouveautes] loadData", error);
    }
  }, []);

  // Chargement initial
  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "passenger") return;
    if (user.id !== params.id) return;
    void loadData();
  }, [loadData, params.id, user]);

  // SSE : mise à jour temps réel lorsque les nouveautés changent
  useEffect(() => {
    if (!user || user.id !== params.id) return;
    const es = new EventSource("/api/sse/db-watch/nouveautes");
    let isFirst = true;
    es.addEventListener("update", () => {
      if (isFirst) { isFirst = false; return; }
      void loadData();
    });
    return () => es.close();
  }, [user, params.id, loadData]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") return null;

  return <NouveautesPage items={items} />;
}
