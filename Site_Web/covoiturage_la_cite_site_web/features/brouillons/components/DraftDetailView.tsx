"use client";

/**
 * @file DraftDetailView.tsx
 * @description Panneau détail d'un brouillon : affiche le CreateTripForm
 * pré-rempli avec les valeurs du DraftTrip sélectionné.
 */

import { CreateTripForm } from "@/features/trajets/components/create-trip/CreateTripForm";
import type { DraftTrip } from "@/features/brouillons/types";

interface DraftDetailViewProps {
  draft: DraftTrip;
}

export function DraftDetailView({ draft }: DraftDetailViewProps) {
  return (
    <CreateTripForm
      key={draft.id}
      driverName="Conducteur"
      vehicles={[]}
      initialValues={{
        departureLocation: draft.departureLocation,
        arrivalLocation:   draft.arrivalLocation,
        departureDate:     draft.departureDate,
        departureTime:     draft.departureTime,
      }}
    />
  );
}
