"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";

import type {
  PublishedTrip,
  PublishedTripCardModel,
  Reservation,
} from "@/features/dashboard/types";
import { PublishedTripCard } from "@/features/dashboard/components/driver/published_trips.section";
import { ReservationCard } from "@/features/dashboard/components/passenger/reservations.section";
import { useReservations } from "@/features/dashboard/hooks/useReservations";
import { usePublishedTrips } from "@/features/dashboard/hooks/usePublishedTrips";
import type { RidesListProps } from "@/features/planner/types/rides.area.types";
import { Language, useAppState } from "@/core/state/app_state";

function InProgressBlockToast({
  isOpen,
  onClose,
  isFR,
}: {
  isOpen: boolean;
  onClose: () => void;
  isFR: boolean;
}) {
  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-4 max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <div className="mb-4 text-6xl">!</div>
        <h3 className="mb-3 text-2xl font-bold text-gray-900">
          {isFR ? "Trajet deja en cours" : "Trip already in progress"}
        </h3>
        <p className="mb-6 text-lg text-gray-600">
          {isFR
            ? "Vous avez deja un trajet en cours. Veuillez le terminer avant d'en demarrer un nouveau."
            : "You already have a trip in progress. Please finish it before starting a new one."}
        </p>
        <button
          onClick={onClose}
          className="rounded-full bg-[#08316e] px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-[#0a4a9e]"
        >
          {isFR ? "Compris" : "Got it"}
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function RidesList({
  isDriver,
  visibleRides,
  formatStatus,
  getStatusColor,
  onCancelTrip,
  onCancelReservation,
  onStartReservation,
}: RidesListProps) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const { lang }     = useAppState();
  const isFR         = lang === Language.FR;

  // Pulse 3.5s sur le trajet nouvellement créé
  const [pulsingId, setPulsingId] = useState<string | null>(
    () => searchParams.get("newTripId"),
  );
  const newCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pulsingId) return;
    const t = setTimeout(() => setPulsingId(null), 3500);
    return () => clearTimeout(t);
  }, [pulsingId]);

  const driverRides = useMemo(
    () => (isDriver ? (visibleRides as PublishedTrip[]) : []),
    [isDriver, visibleRides],
  );
  const passengerRides = useMemo(
    () => (!isDriver ? (visibleRides as Reservation[]) : []),
    [isDriver, visibleRides],
  );

  const [showBlockToast, setShowBlockToast] = useState(false);

  const {
    tripModels,
    isPassengerListOpens,
    setIsPassengerListOpens,
    hasInProgressTrip,
  } = usePublishedTrips(driverRides);

  // Scroll vers la carte nouvellement créée dès qu'elle apparaît dans la liste
  useEffect(() => {
    if (!newCardRef.current) return;
    newCardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [tripModels]);

  const {
    reservations,
    isActionLoading,
    openPassengerLists,
    togglePassengerList,
    closePassengerList,
    cancelReservation,
    startReservation,
  } = useReservations(passengerRides, {
    onCancel: onCancelReservation,
    onStart: onStartReservation,
  });

  if (isDriver) {
    return (
      <>
        {tripModels.map((model, index) => {
          const cardModel: PublishedTripCardModel = {
            ...model,
            isPassengerListOpen:
              isPassengerListOpens[index]?.isPassengerListOpen ?? false,
          };

          const isNew = pulsingId === String(model.trip.id);

          return (
            <div
              key={String(model.trip.id)}
              ref={isNew ? newCardRef : undefined}
              className={`w-full transform scale-x-95 rounded-xl transition-shadow duration-300 ${
                isNew ? "ring-2 ring-[#08316e]/50 shadow-[0_0_18px_4px_rgba(8,49,110,0.18)] animate-pulse" : ""
              }`}
            >
              <PublishedTripCard
                model={cardModel}
                index={index}
                isPassengerListOpens={isPassengerListOpens}
                setIsPassengerListOpens={setIsPassengerListOpens}
                formatStatus={formatStatus}
                getStatusColor={getStatusColor}
                hasInProgressTrip={hasInProgressTrip}
                onBlockStart={() => setShowBlockToast(true)}
                onCancelTrip={async (id) => { await onCancelTrip?.(id); }}
                onStartTrip={async () => {}}
              />
            </div>
          );
        })}
      </>
    );
  }

  return (
    <>
      {reservations.map((ride, index) => (
        <div key={String(ride.id)} className="w-full transform scale-x-95">
          <ReservationCard
            reservation={ride}
            isPassengerListOpen={openPassengerLists[index] ?? false}
            onTogglePassengerList={() => togglePassengerList(index)}
            onClosePassengerList={() => closePassengerList(index)}
            onCancelConfirm={(reservationId) => {
              void cancelReservation(reservationId);
            }}
            onStartTrip={(reservationId) => {
              void startReservation(reservationId).then((tripId) => {
                if (tripId) {
                  router.push(`/trajet-en-cours/${tripId}`);
                }
              });
            }}
            isActionLoading={isActionLoading}
            />
          </div>
        ))}
        <InProgressBlockToast
          isOpen={showBlockToast}
          onClose={() => setShowBlockToast(false)}
          isFR={isFR}
        />
      </>
    );
  }
