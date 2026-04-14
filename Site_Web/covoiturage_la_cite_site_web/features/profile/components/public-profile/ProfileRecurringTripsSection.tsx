/**
 * ProfileRecurringTripsSection - Section Trajets Récurrents
 * Anciennement dans [id]/page.tsx lignes 457-472
 */

"use client";

import { ProfileUsualTripCard } from "@/features/profile/components/ProfileUsualTripCard";
import type { UsualTrip } from "@/features/profile/types/profile.types";

interface ProfileRecurringTripsSectionProps {
  recurringTripsLabel: string;
  trips: UsualTrip[];
  driverId: string;
  driverName: string;
  onSubscribe: (departure: string, arrival: string) => Promise<void>;
}

export function ProfileRecurringTripsSection({
  recurringTripsLabel,
  trips,
  driverId,
  driverName,
  onSubscribe,
}: ProfileRecurringTripsSectionProps) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-bold">{recurringTripsLabel} ({trips.length})</h2>
      <div className="flex flex-col gap-3 max-h-96 overflow-y-auto">
        {trips.map((trip) => (
          <ProfileUsualTripCard
            key={trip.departureLabel + trip.arrivalLabel}
            departure={trip.departureLabel}
            arrival={trip.arrivalLabel}
            driverId={driverId}
            driverName={driverName}
            onSubscribe={onSubscribe}
          />
        ))}
      </div>
    </section>
  );
}
