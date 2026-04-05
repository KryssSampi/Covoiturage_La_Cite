"use client";

import { useState } from "react";
import { FaArrowRight, FaBell, FaCheck } from "react-icons/fa6";

export interface ProfileUsualTripCardProps {
  departure: string;
  arrival: string;
  driverId: string;
  driverName: string;
  onSubscribe?: (departure: string, arrival: string) => Promise<void>;
}

export function ProfileUsualTripCard({
  departure,
  arrival,
  driverId,
  driverName,
  onSubscribe,
}: ProfileUsualTripCardProps) {
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (subscribed || loading) return;
    setLoading(true);
    try {
      await onSubscribe?.(departure, arrival);
      setSubscribed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm">
      <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-gray-800">
        <span className="truncate">{departure}</span>
        <FaArrowRight className="shrink-0 text-gray-400" size={11} />
        <span className="truncate">{arrival}</span>
      </div>

      <button
        onClick={handleSubscribe}
        disabled={subscribed || loading}
        className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
          subscribed
            ? "bg-green-100 text-green-700 cursor-default"
            : "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        }`}
        aria-label={subscribed ? "Abonné" : `S'abonner aux trajets ${departure} → ${arrival} de ${driverName}`}
      >
        {subscribed ? (
          <>
            <FaCheck size={10} /> Abonné
          </>
        ) : loading ? (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
        ) : (
          <>
            <FaBell size={10} /> S&apos;abonner
          </>
        )}
      </button>
    </div>
  );
}
