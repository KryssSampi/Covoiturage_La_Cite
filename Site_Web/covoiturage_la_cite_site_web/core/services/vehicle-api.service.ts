import type { VehicleModel } from '@/core/models/VehicleModel';
import { generatePrefixedId, nowIso } from '@/core/utils/api-route.utils';
import { persistenceManager } from '@/tests/PersistenceManager';

export interface VehiclePayload extends Partial<VehicleModel> {
  driverId?: string;
  make?: string;
  model?: string;
}

export function queryVehicles(driverId?: string | null): VehicleModel[] {
  const vehicles = persistenceManager.readAll<VehicleModel>('vehicles');
  return driverId ? vehicles.filter((vehicle) => vehicle.driverId === driverId) : vehicles;
}

export function buildVehicleRecord(payload: VehiclePayload): { vehicle?: VehicleModel; error?: string; status?: number } {
  if (!payload.driverId || !payload.make || !payload.model) {
    return { error: 'driverId, make et model sont requis', status: 400 };
  }

  const now = nowIso();

  return {
    vehicle: {
      ...(payload as VehicleModel),
      id: payload.id ?? generatePrefixedId('VEH'),
      createdAt: payload.createdAt ?? now,
      updatedAt: now,
    },
  };
}
