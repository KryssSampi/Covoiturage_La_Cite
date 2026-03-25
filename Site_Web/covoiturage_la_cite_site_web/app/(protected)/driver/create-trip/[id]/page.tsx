"use client";

/**
 * Route : /driver/create-trip/[id]
 * [id] = ID du conducteur
 *
 * La page fait le fetch : GET /api/vehicles?driverId=[id]
 * Si un seul véhicule → sélecteur désactivé dans le formulaire.
 *
 * SearchParams optionnels (pré-remplissage depuis un circuit TripWay) :
 *   ?lieu_de_depart=lng,lat&lieu_darrivee=lng,lat&departure_date=...&departure_time=...
 *
 * Layout hérité : app/(protected)/layout.tsx
 */

import { useEffect, useState }                   from "react";
import { useParams, useSearchParams }            from "next/navigation";
import { CreateTripForm }                        from "@/features/trajets";
import type { TripWayPrefill }                   from "@/features/trajets/types";
import type { MockVehicle }                      from "@/features/trajets/constants/trip.constants";

interface VehicleRecord {
  id:       string;
  make:     string;
  model:    string;
  year?:    number;
  color?:   string;
  maxSeats: number;
}

export default function CreateTripPage() {
  const params       = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const driverId     = params.id;

  const [vehicles, setVehicles] = useState<MockVehicle[]>([]);

  // Fetch des véhicules du conducteur
  useEffect(() => {
    if (!driverId) return;

    fetch(`/api/vehicles?driverId=${encodeURIComponent(driverId)}`)
      .then((r) => r.ok ? r.json() as Promise<VehicleRecord[]> : Promise.resolve([]))
      .then((data) =>
        setVehicles(
          data.map((v) => ({
            id:            v.id,
            label:         `${v.make} ${v.model}${v.year ? ` ${v.year}` : ''}`,
            maxPassengers: v.maxSeats,
            color:         v.color,
          }))
        )
      )
      .catch(() => { /* erreur réseau silencieuse — formulaire sans véhicule */ });
  }, [driverId]);

  // Construction des valeurs pré-remplies depuis les searchParams
  const initialValues: TripWayPrefill = {
    ...(searchParams.get("lieu_de_depart")  && { departureLocation: searchParams.get("lieu_de_depart")!  }),
    ...(searchParams.get("lieu_darrivee")   && { arrivalLocation:   searchParams.get("lieu_darrivee")!   }),
    ...(searchParams.get("departure_date")  && { departureDate:     searchParams.get("departure_date")!  }),
    ...(searchParams.get("departure_time")  && { departureTime:     searchParams.get("departure_time")!  }),
  };

  return (
    <CreateTripForm
      initialValues={initialValues}
      vehicles={vehicles}
    />
  );
}
