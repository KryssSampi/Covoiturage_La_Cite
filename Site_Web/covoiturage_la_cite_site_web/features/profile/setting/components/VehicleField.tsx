/**
 * VehicleField — Composant dumb pour le rendu d'un champ de véhicule
 */

"use client";

import type { AdminEditableField } from "@/features/profile/types/profile.types";
import { AdminWarningMessage } from "@/features/profile/setting/components/AdminWarningMessage";

interface VehicleFieldProps {
  field: AdminEditableField;
  label: string;
  value: string | number;
  editable: boolean;
  options?: { label: string; value: string | number }[];
  onChange: (field: AdminEditableField, value: string | number) => void;
}

export function VehicleField({ field, label, value, editable, options, onChange }: VehicleFieldProps) {
  return (
    <div>
      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
        <div className="flex-1">
          <p className="text-xs text-gray-400">{label}</p>
          {editable && options ? (
            <select
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 bg-white
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {options.map((opt) => (
                <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : editable ? (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              className="w-full mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900
                         focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          ) : (
            <p className="text-sm font-medium text-gray-700">{value}</p>
          )}
        </div>
      </div>
      {editable && <AdminWarningMessage field={field} />}
    </div>
  );
}
