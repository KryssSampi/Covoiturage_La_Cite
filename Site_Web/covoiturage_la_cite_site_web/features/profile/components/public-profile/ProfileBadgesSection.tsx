/**
 * ProfileBadgesSection - Section Badges, Langues et Véhicule
 * Anciennement dans [id]/page.tsx lignes 371-412
 */

"use client";

import Image from "next/image";
import { FaStar, FaCar, FaLeaf } from "react-icons/fa6";

interface Badge {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  FaCar: FaCar,
  FaClock: FaCar,
  FaLeaf: FaLeaf,
  FaSeedling: FaLeaf,
  FaFaceSmile: FaCar,
};

function BadgeItem({ name, icon, color }: { name: string; icon: string; color: string }) {
  const IconComponent = iconMap[icon] || FaStar;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${color} text-xl text-[#08316e]`}>
        <IconComponent size={20} />
      </div>
      <span className="text-center text-xs font-medium text-gray-600">{name}</span>
    </div>
  );
}

interface ProfileBadgesSectionProps {
  badgesLabel: string;
  badges: Badge[];
  languagesLabel: string;
  frenchLabel: string;
  englishLabel: string;
  vehicleLabel: string;
  vehiclePhotoUrl?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleColor?: string;
  vehicleYear?: number;
}

export function ProfileBadgesSection({
  badgesLabel,
  badges,
  languagesLabel,
  frenchLabel,
  englishLabel,
  vehicleLabel,
  vehiclePhotoUrl,
  vehicleMake,
  vehicleModel,
  vehicleColor,
  vehicleYear,
}: ProfileBadgesSectionProps) {
  return (
    <div className="mb-6 grid grid-cols-3 gap-4">
      <div className="bg-white p-5 justify-center items-center rounded-lg shadow-sm m-auto">
        <h3 className="mb-2 text-sm font-semibold text-gray-700">{badgesLabel}</h3>
        <div className="flex gap-3">
          {badges.map((badge) => (
            <BadgeItem key={badge.id} {...badge} />
          ))}
        </div>
      </div>
      <div className="bg-white p-5 justify-center items-center rounded-lg shadow-sm my-auto">
        <h3 className="mb-2 text-md font-semibold text-gray-700">{languagesLabel}</h3>
        <div className="flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-sm text-[#08316e]">
             {frenchLabel}
          </span>,
          <span className="flex items-center gap-1 text-sm text-[#08316e]">
             {englishLabel}
          </span>
        </div>
      </div>
      {vehiclePhotoUrl && (
        <div className="bg-white p-5 justify-center items-center rounded-lg shadow-sm my-auto">
              <h3 className="mb-2 text-md font-semibold text-gray-700">{vehicleLabel}</h3>
          <div className="relative h-32 w-full rounded-xl bg-gray-100">
            <Image
              src={vehiclePhotoUrl}
              alt={vehicleLabel}
              fill
              className="object-cover"
            />
          </div>
          <p className="mt-1 text-center text-sm text-gray-500">
            {vehicleMake} {vehicleModel} {vehicleColor}, {vehicleYear}
          </p>
        </div>
      )}
    </div>
  );
}
