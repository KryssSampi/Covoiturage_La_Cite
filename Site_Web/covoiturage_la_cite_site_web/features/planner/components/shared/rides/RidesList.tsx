"use client";

/**
 * @file RidesList.tsx
 * @description Liste des cartes de trajets du jour.
 * Rend PublishedTripCard (conducteur) ou ReservationCard (passager)
 * selon le rôle de l'utilisateur connecté.
 */

import {
  PublishedTrip,
  PublishedTripCardModel,
  Reservation,
}                             from "@/features/dashboard/types";
import { PublishedTripCard }  from "@/features/dashboard/components/driver/published_trips.section";
import { ReservationCard }    from "@/features/dashboard/components/passenger/reservations.section";
import type { RidesListProps } from "@/features/planner/types/rides.area.types";

/**
 * Affiche la liste des cartes de trajets adaptée au rôle :
 * - Conducteur → PublishedTripCard avec gestion de la liste des passagers
 * - Passager   → ReservationCard avec toggle de liste
 */
export function RidesList({
  isDriver,
  visibleRides,
  isPassengerListOpens,
  setIsPassengerListOpens,
  formatStatus,
  getStatusColor,
  openPassengerLists,
  setOpenPassengerLists,
}: RidesListProps) {
  // ─── Vue conducteur ───────────────────────────────────────────────────────
  if (isDriver) {
    return (
      <>
        {(visibleRides as PublishedTrip[]).map(ride => {
          // Construction du modèle attendu par PublishedTripCard
          const model: PublishedTripCardModel = {
            trip:                ride,
            isPassengerListOpen: isPassengerListOpens[ride.id - 1]?.isPassengerListOpen ?? false,
          };
          return (
            <div key={ride.id} className="w-full transform scale-x-95 ">
            <PublishedTripCard
              key={ride.id}
              model={model}
              isPassengerListOpens={isPassengerListOpens}
              setIsPassengerListOpens={setIsPassengerListOpens}
              formatStatus={formatStatus}
              getStatusColor={getStatusColor}
            />
            </div>
          );
        })}
      </>
    );
  }

  // ─── Vue passager ─────────────────────────────────────────────────────────
  return (
    <>
      {(visibleRides as Reservation[]).map((ride, idx) => (
         <div key={ride.id} className="w-full transform scale-x-95">
        <ReservationCard
          key={ride.id}
          reservation={ride}
          isPassengerListOpen={openPassengerLists[idx] ?? false}
          onTogglePassengerList={() =>
            setOpenPassengerLists(prev =>
              prev.map((v, i) => (i === idx ? !v : v)),
            )
          }
          onClosePassengerList={() =>
            setOpenPassengerLists(prev =>
              prev.map((v, i) => (i === idx ? false : v)),
            )
          }
        />
        </div>
      ))}
    </>
  );
}
