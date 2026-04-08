import type { VehicleModel } from '@/core/models/VehicleModel';
import type { MockVehicle } from '@/features/trajets/constants/trip.constants';

/**
 * Mappe un objet véhicule (VehicleModel ou shape similaire) en `MockVehicle`
 * Permet de centraliser le mapping utilisé par plusieurs pages.
 */
export function vehicleToMockVehicle(v: Partial<VehicleModel> & { id?: string; maxSeats?: number } ): MockVehicle {
  const id = v.id ?? String(Date.now());
  const make = (v as any).make ?? '';
  const model = (v as any).model ?? '';
  const year = (v as any).year ? ` ${ (v as any).year }` : '';
  const label = `${make} ${model}${year}`.trim();
  const maxPassengers = v.maxSeats ?? ( (v as any).maxPassengers ?? 4 );
  const color = (v as any).color;

  return {
    id,
    label,
    maxPassengers,
    color,
  };
}

export function vehicleModelToMockVehicle(v: VehicleModel): MockVehicle {
  return vehicleToMockVehicle(v);
}
