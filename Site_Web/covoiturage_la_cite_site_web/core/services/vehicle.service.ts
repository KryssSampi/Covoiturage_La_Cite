import { staticDb } from '@/tests/db/StaticDb';
import type { VehicleModel } from '@/core/models/VehicleModel';

/**
 * VehicleService — Service d'accès aux données véhicule
 */
export const VehicleService = {
  async getAll(): Promise<VehicleModel[]> {
    return staticDb.getAll('vehicles');
  },

  async getById(id: string): Promise<VehicleModel | null> {
    return staticDb.getById('vehicles', id);
  },

  async getByDriverId(driverId: string): Promise<VehicleModel[]> {
    const all = await staticDb.getAll('vehicles');
    return all.filter((v) => v.driverId === driverId && v.isActive);
  },

  /** Libellé court du véhicule, ex: "Toyota Corolla 2022 (Gris perle)" */
  getLabel(vehicle: VehicleModel): string {
    return `${vehicle.make} ${vehicle.model} ${vehicle.year} (${vehicle.color})`;
  },

  generateId(): string {
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000);
    return `VEH-${year}-${rand}`;
  },
};
