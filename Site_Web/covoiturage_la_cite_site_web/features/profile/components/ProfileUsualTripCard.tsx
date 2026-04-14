"use client";

import { useState } from "react";
import { FaArrowRight, FaBell, FaCheck } from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";

export interface ProfileUsualTripCardProps {
  departure: string;
  arrival: string;
  driverId: string;
  driverName: string;
  onSubscribe?: (departure: string, arrival: string) => Promise<void>;
  subscribed?: boolean;
}

const ICON_COLOR = "#08316e";

// ── Traductions ───────────────────────────────────────────────────────────────

const translations = {
  fr: {
    subscribed: "Abonné",
    subscribe: "S'abonner",
  },
  en: {
    subscribed: "Subscribed",
    subscribe: "Subscribe",
  },
};

export function ProfileUsualTripCard({
  departure,
  arrival,
  driverId,
  driverName,
  onSubscribe,
  subscribed: externalSubscribed,
}: ProfileUsualTripCardProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  const [internalSubscribed, setInternalSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const subscribed = externalSubscribed ?? internalSubscribed;

  const handleSubscribe = async () => {
    if (subscribed || loading) return;
    setLoading(true);
    try {
      await onSubscribe?.(departure, arrival);
      if (externalSubscribed === undefined) {
        setInternalSubscribed(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-100 bg-white px-6 py-5 shadow-sm min-h-20">
      <div className="flex min-w-0 items-center gap-3 text-base font-medium text-gray-800">
        <span className="truncate">{departure}</span>
        <FaArrowRight className="shrink-0" size={14} style={{ color: ICON_COLOR }} />
        <span className="truncate">{arrival}</span>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={subscribed || loading}
        className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
          subscribed
            ? "bg-green-100 text-green-700 cursor-default"
            : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        }`}
        aria-label={subscribed ? t.subscribed : `${t.subscribe} ${departure} → ${arrival} ${driverName}`}
      >
        {subscribed ? (
          <>
            <FaCheck size={12} /> {t.subscribed}
          </>
        ) : loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <FaBell size={12} /> {t.subscribe}
          </>
        )}
      </button>
    </div>
  );
}
