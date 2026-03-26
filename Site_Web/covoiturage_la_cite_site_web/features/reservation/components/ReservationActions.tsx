"use client";

import { ReservationStatus } from "@/features/dashboard/types";

interface ReservationActionsProps {
  reservationId: string;
  status: ReservationStatus;
  role: "driver" | "passenger";
  onAction: (action: "accept" | "refuse" | "cancel") => void;
}

/**
 * Boutons d'action contextuels pour une réservation.
 * Aucun appel API — délègue via callback `onAction`.
 *
 * Logique :
 *   driver   + pending    → Accepter / Refuser
 *   passenger + pending    → Annuler
 *   passenger + confirmed  → Annuler
 *   autres combinaisons   → aucun bouton
 */
export function ReservationActions({ status, role, onAction }: ReservationActionsProps) {
  const isDriver = role === "driver";
  const isPassenger = role === "passenger";

  const showAcceptRefuse = isDriver && status === ReservationStatus.Pending;
  const showCancel =
    isPassenger &&
    (status === ReservationStatus.Pending || status === ReservationStatus.Confirmed);

  if (!showAcceptRefuse && !showCancel) return null;

  return (
    <div className="flex items-center gap-2">
      {showAcceptRefuse && (
        <>
          <button
            onClick={() => onAction("accept")}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 active:scale-95 transition-all"
          >
            Accepter
          </button>
          <button
            onClick={() => onAction("refuse")}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 active:scale-95 transition-all"
          >
            Refuser
          </button>
        </>
      )}

      {showCancel && (
        <button
          onClick={() => onAction("cancel")}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 active:scale-95 transition-all"
        >
          Annuler
        </button>
      )}
    </div>
  );
}
