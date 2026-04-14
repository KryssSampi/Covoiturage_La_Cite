/**
 * VehicleCard — Carte de véhicule pour la liste "Vos véhicules"
 */

"use client";

import Image from "next/image";
import type { VehicleInfo } from "@/features/profile/types/profile.types";

const VEHICLE_PHOTO_FALLBACK = "/assets/placeholder/no-car-image.jpg";

interface VehicleCardProps {
  vehicle: VehicleInfo;
  isActive: boolean;
  onSelect: () => void;
}

export function VehicleCard({ vehicle, isActive, onSelect }: VehicleCardProps) {
  const passengerSeats = Math.max(0, vehicle.maxSeats - 1);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex min-w-[160px] flex-col overflow-hidden rounded-xl border-2 transition-all ${
        isActive
          ? "border-blue-500 bg-blue-50 shadow-md"
          : "border-gray-200 bg-white hover:border-gray-300"
      }`}
    >
      <div className="relative h-20 w-full bg-gray-100">
        <Image
          src={vehicle.photoUrl ?? VEHICLE_PHOTO_FALLBACK}
          alt={`${vehicle.make} ${vehicle.model}`}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-2 text-left">
        <p className="text-sm font-semibold text-gray-800">
          {vehicle.make} {vehicle.model}
        </p>
        <p className="text-xs text-gray-500">{vehicle.year}</p>
        <p className="text-xs text-gray-400">{passengerSeats} places pass.</p>
      </div>
    </button>
  );
}
