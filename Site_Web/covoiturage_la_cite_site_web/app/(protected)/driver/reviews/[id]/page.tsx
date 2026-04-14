"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLoader } from "@/core/context/loader.context";
import { useAppState } from "@/core/state/app_state";
import { ReviewsPage } from "@/features/reviews";
import type { Review } from "@/features/dashboard/types";

export default function DriverReviewsRoutePage() {
  const appState = useAppState();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { setActiveLoader } = useLoader();
  const user = appState.userConnected;
  const [items, setItems] = useState<Review[]>([]);

  useEffect(() => {
    if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "driver") {
      setActiveLoader(true);
      router.push(`/${user?.role?.toString().toLowerCase()}/${user?.id}`);
    } else {
      const timer = setTimeout(() => setActiveLoader(false), 300);
      return () => clearTimeout(timer);
    }
  }, [user, params, router, setActiveLoader]);

  useEffect(() => {
    if (!user || user.role?.toString().toLowerCase() !== "driver") return;
    if (user.id !== params.id) return;

    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/reviews/enriched?revieweeId=${encodeURIComponent(user.id)}`);
        if (!res.ok || cancelled) return;
        const data: Review[] = await res.json();
        if (!cancelled) setItems(data);
      } catch (error) {
        console.error("[driver/reviews] fetchData", error);
      }
    };

    void fetchData();
    const intervalId = setInterval(() => { void fetchData(); }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [user, params.id]);

  if (user?.id !== params.id || user?.role?.toString().toLowerCase() !== "driver") return null;

  return <ReviewsPage items={items} />;
}