/**
 * ProfilePublishedTripsSection - Section Derniers Trajets Publiés
 * Anciennement dans [id]/page.tsx lignes 475-485
 */

"use client";

import { RecommendedTripCard } from "@/features/search/components/shared/RecommendedTripCard";
import type { Trip } from "@/features/dashboard/types";

interface ProfilePublishedTripsSectionProps {
  publishedTripsLabel: string;
  trips: Trip[];
}

export function ProfilePublishedTripsSection({
  publishedTripsLabel,
  trips,
}: ProfilePublishedTripsSectionProps) {
  return (
    <section className="bg-white p-5 rounded-lg shadow-sm">
      <h2 className="mb-3 text-lg font-bold">
        {publishedTripsLabel}
      </h2>
      <div className="flex flex-col gap-3">
        {trips.map((trip) => (
          <RecommendedTripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </section>
  );
}
