"use client";

import React from "react";
import { FaRotate, FaTriangleExclamation, FaCircleCheck, FaCircleXmark } from "react-icons/fa6";
import type { AdminTrip, SimulationEvent, SimulateResult } from "@/features/admin/types/adminTrips";
import type { AutoplayState } from "@/features/admin/hooks/useAdminTrips";
import TripSimulationCard from "./TripSimulationCard";

export default function AdminTripsPanel({
  trips = [],
  loading = false,
  error = null,
  onRefresh,
  simResult = null,
  simBusy = false,
  onSimulate,
  onStartAutoplay,
  onStopAutoplay,
  autoplayStates = {},
  autoplayProgress = {},
}: {
  trips?: AdminTrip[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => Promise<void> | void;
  simResult?: SimulateResult | null;
  simBusy?: boolean;
  onSimulate?: (tripId: string, event: SimulationEvent) => Promise<void>;
  onStartAutoplay?: (trip: AdminTrip) => Promise<void>;
  onStopAutoplay?: (tripId: string) => void;
  autoplayStates?: Record<string, AutoplayState>;
  autoplayProgress?: Record<string, number>;
}) {
  async function handleSimulate(tripId: string, event: SimulationEvent) {
    await onSimulate?.(tripId, event);
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-700">
            Trajets - Simulation d'evenements
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Selectionnez un evenement pour simuler son impact reel sur les donnees et les paiements.
          </p>
        </div>
        <button
          onClick={() => void onRefresh?.()}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-white border border-[rgba(8,49,110,0.2)] text-[#08316e] rounded-lg text-xs font-semibold hover:bg-[#f0f4fb] transition-colors disabled:opacity-50"
        >
          <FaRotate size={11} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {simResult && (
        <div
          className={`mb-4 flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${
            simResult.success
              ? "bg-[rgba(10,173,106,0.07)] border-[rgba(10,173,106,0.25)] text-[#0aad6a]"
              : "bg-[rgba(224,48,80,0.07)] border-[rgba(224,48,80,0.25)] text-[#e03050]"
          }`}
        >
          {simResult.success
            ? <FaCircleCheck size={16} className="shrink-0 mt-0.5" />
            : <FaCircleXmark size={16} className="shrink-0 mt-0.5" />
          }
          <div>
            <div className="font-semibold">{simResult.message}</div>
            {simResult.penalite && simResult.penalite.montant > 0 && (
              <div className="text-xs mt-0.5 opacity-80">
                Penalite : {simResult.penalite.montant}$ - Reputation : -{simResult.penalite.pointsReputation} pts
                {simResult.penalite.suspension && ` - Suspension : ${simResult.penalite.suspension.replace("_", " ")}`}
              </div>
            )}
            <div className="text-xs mt-0.5 opacity-60">Trajet : {simResult.tripId}</div>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-3 py-8 text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-400" />
          <span>Chargement des trajets...</span>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          <FaTriangleExclamation size={14} />
          {error}
        </div>
      )}

      {!loading && !error && trips.length === 0 && (
        <div className="text-center text-gray-400 py-10 text-sm">
          Aucun trajet trouve dans la base de donnees.
        </div>
      )}

      {!loading && trips.length > 0 && (
        <div className="flex flex-col gap-2">
          {trips.map((trip) => (
            <TripSimulationCard
              key={trip.id}
              trip={trip}
              onSimulate={handleSimulate}
              busy={simBusy}
              onStartAutoplay={onStartAutoplay}
              onStopAutoplay={onStopAutoplay}
              autoplayState={autoplayStates[trip.id]}
              autoplayProgress={autoplayProgress[trip.id] ?? 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}
