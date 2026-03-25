"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  const driverRides = useMemo(
    () => (isDriver ? (visibleRides as PublishedTrip[]) : []),
    [isDriver, visibleRides],
  );
  const passengerRides = useMemo(
    () => (!isDriver ? (visibleRides as Reservation[]) : []),
    [isDriver, visibleRides],
  );

  const [showBlockToast, setShowBlockToast] = useState(false);
  const [hiddenTripIds, setHiddenTripIds] = useState<Set<string>>(new Set());
  const visibleDriverRides = useMemo(
    () => driverRides.filter((ride) => !hiddenTripIds.has(String(ride.id))),
    [driverRides, hiddenTripIds],
  );

  const {
    tripModels,
    isPassengerListOpens,
    setIsPassengerListOpens,
    hasInProgressTrip,
  } = usePublishedTrips(visibleDriverRides);

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

          return (
            <div key={String(model.trip.id)} className="w-full transform scale-x-95">
              <PublishedTripCard
                model={cardModel}
                index={index}
                isPassengerListOpens={isPassengerListOpens}
                setIsPassengerListOpens={setIsPassengerListOpens}
                formatStatus={formatStatus}
                getStatusColor={getStatusColor}
                hasInProgressTrip={hasInProgressTrip}
                onBlockStart={() => setShowBlockToast(true)}
                onHideTrip={(tripId) =>
                  setHiddenTripIds((prev) => new Set(prev).add(String(tripId)))
                }
                onRestoreTrip={(tripId) =>
                  setHiddenTripIds((prev) => {
                    const next = new Set(prev);
                    next.delete(String(tripId));
                    return next;
                  })
                }
                onCancelTrip={onCancelTrip}
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
