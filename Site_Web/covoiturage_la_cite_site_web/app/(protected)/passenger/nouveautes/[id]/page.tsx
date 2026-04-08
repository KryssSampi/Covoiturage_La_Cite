"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { NouveautesPage } from "@/features/nouveautes";
import type { NouveauteModel } from "@/core/models/NouveauteModel";

export default function PassengerNouveautesRoutePage() {
  const appState = useAppState();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { setActiveLoader } = useLoader();
  const user = appState.userConnected;
  const [items, setItems] = useState<NouveauteModel[]>([]);

  useEffect(() => {
    if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") {
      setActiveLoader(true);
      router.push(`/${user?.role?.toString().toLowerCase()}/${user?.id}`);
    } else {
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [user, params, router, setActiveLoader]);

  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "passenger") return;
    if (user.id !== params.id) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/nouveautes");
        if (!res.ok || cancelled) return;
        const data: NouveauteModel[] = await res.json();
        if (!cancelled) setItems(data);
      } catch (error) {
        console.error("[passenger/nouveautes] fetchData", error);
      }
    };

    void fetchData();
    const intervalId = setInterval(() => { void fetchData(); }, 60_000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [user, params.id]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "passenger") return null;

  return <NouveautesPage items={items} />;
}