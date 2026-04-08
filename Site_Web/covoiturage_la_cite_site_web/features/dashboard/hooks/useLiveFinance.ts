"use client";

import { useEffect, useRef, useState } from "react";
import type { DriverFinanceSummary } from "@/features/dashboard/types";

interface UseLiveFinanceResult {
  finance: DriverFinanceSummary | null;
  isLoading: boolean;
  error: string | null;
}

export function useLiveFinance(driverId: string | undefined): UseLiveFinanceResult {
  const [finance, setFinance] = useState<DriverFinanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!driverId);
  const [error, setError] = useState<string | null>(null);

  const financeRef = useRef(finance);
  useEffect(() => { financeRef.current = finance; }, [finance]);

  useEffect(() => {
    if (!driverId) return;

    let cancelled = false;

    const fetchFinance = async () => {
      try {
        const res = await fetch(`/api/dashboard/driver/${encodeURIComponent(driverId)}/finance`);
        if (!res.ok) throw new Error("Echec de chargement des finances");
        const data: DriverFinanceSummary = await res.json();
        if (cancelled) return;
        setFinance(data);
        setIsLoading(false);
        setError(null);
      } catch (err) {
        console.error("[useLiveFinance] fetch", err);
        if (!financeRef.current) {
          setError("Connexion au flux financier interrompue.");
          setIsLoading(false);
        }
      }
    };

    void fetchFinance();
    const intervalId = setInterval(() => { void fetchFinance(); }, 30_000);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [driverId]);

  return { finance, isLoading, error };
}