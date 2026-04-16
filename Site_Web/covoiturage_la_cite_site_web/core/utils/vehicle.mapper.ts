import type { VehicleModel } from '@/core/models/VehicleModel';
import type { MockVehicle } from '@/features/trajets/constants/trip.constants';

/**
 * Mappe un objet véhicule (VehicleModel ou shape similaire) en `MockVehicle`
 * Permet de centraliser le mapping utilisé par plusieurs pages.
 */
export function vehicleToMockVehicle(v: { id?: string; maxSeats?: number; [key: string]: unknown }): MockVehicle {
  const id = (v.id as string | undefined) ?? String(Date.now());
  const make = (v.make as string | undefined) ?? '';
  const model = (v.model as string | undefined) ?? '';
  const year = v.year ? ` ${v.year as string}` : '';
  const label = `${make} ${model}${year}`.trim();
  const maxPassengers = v.maxSeats ?? ((v.maxPassengers as number | undefined) ?? 4);
  const color = v.color as string | undefined;

  return {
    id,
    label,
    maxPassengers,
    color,
  };
}

export function vehicleModelToMockVehicle(v: VehicleModel): MockVehicle {
  return vehicleToMockVehicle(v as unknown as Record<string, unknown>);
}

