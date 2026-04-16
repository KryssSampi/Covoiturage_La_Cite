"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CreateTripForm } from "@/features/trajets";
import type { TripWayPrefill } from "@/features/trajets/types";
import type { MockVehicle } from "@/features/trajets/constants/trip.constants";
import { vehicleToMockVehicle } from '@/core/utils/vehicle.mapper';

interface VehicleRecord {
  id: string;
  make: string;
  model: string;
  year?: number;
  color?: string;
  maxSeats: number;
}

export default function CreateTripPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const driverId = params.id;

  const [vehicles, setVehicles] = useState<MockVehicle[]>([]);
  const [isAccessValidated, setIsAccessValidated] = useState(false);

  const initialValues: TripWayPrefill = useMemo(() => ({
    ...(searchParams.get("lieu_de_depart") && { departureLocation: searchParams.get("lieu_de_depart")! }),
    ...(searchParams.get("lieu_darrivee") && { arrivalLocation: searchParams.get("lieu_darrivee")! }),
    ...(searchParams.get("departure_date") && { departureDate: searchParams.get("departure_date")! }),
    ...(searchParams.get("departure_time") && { departureTime: searchParams.get("departure_time")! }),
  }), [searchParams]);

  useEffect(() => {
    if (typeof window === "undefined" || !driverId) return;

    // Récupération et validation de l'accès à partir du sessionStorage
    const selectedCircuitRaw = sessionStorage.getItem("selectedCircuit");
    const accessRaw = sessionStorage.getItem("createTripAccess");
    const hasTripwayPrefill = Boolean(initialValues.departureLocation && initialValues.arrivalLocation);

    let accessIsValid = false;

    if (selectedCircuitRaw && accessRaw && hasTripwayPrefill) {
      try {
        const parsed = JSON.parse(accessRaw) as {
          source?: string;
          userId?: string;
        };

        accessIsValid =
          parsed.source === "tripway-search-selection" &&
          parsed.userId === driverId;
      } catch (e) {
        console.error('[driver/create-trip] Invalid createTripAccess JSON', e);
        accessIsValid = false;
      }
    }

    // Redirection si l'accès n'est pas valide
    if (!accessIsValid) {
      router.replace(`/driver/${encodeURIComponent(driverId)}`);
      return;
    }

    // Récupération des véhicules du conducteur
    fetch(`/api/vehicles?driverId=${encodeURIComponent(driverId)}`)
      .then((r) => {
        if (!r.ok) throw new Error(`Failed to fetch vehicles: ${r.status}`);
        return r.json() as Promise<VehicleRecord[]>;
      })
      .then((data) => {
        // Transformation des données des véhicules pour le formulaire (centralisée)
        setVehicles(data.map((v) => vehicleToMockVehicle(v as unknown as Record<string, unknown>)));
        // Validation de l'accès une fois les véhicules chargés
        setIsAccessValidated(true);
      })
      .catch((error) => {
        console.error('[driver/create-trip] Failed to load vehicles:', error);
        setIsAccessValidated(true);
      });
  }, [driverId, initialValues.arrivalLocation, initialValues.departureLocation, router]);

  if (!isAccessValidated) return null;

  return (
    <CreateTripForm
      initialValues={initialValues}
      vehicles={vehicles}
    />
  );
}
