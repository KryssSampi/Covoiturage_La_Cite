/**
 * AddVehicleCard — Carte d'ajout de véhicule
 */

"use client";

import { FaPlus } from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";

interface AddVehicleCardProps {
  onClick: () => void;
}

const translations = {
  fr: { addVehicle: "Ajouter un véhicule" },
  en: { addVehicle: "Add a vehicle" },
};

export function AddVehicleCard({ onClick }: AddVehicleCardProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-[160px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-4 transition-all hover:border-blue-400 hover:bg-blue-50"
    >
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
        <FaPlus size={16} className="text-blue-600" />
      </div>
      <p className="text-xs font-medium text-gray-600">{t.addVehicle}</p>
    </button>
  );
}
