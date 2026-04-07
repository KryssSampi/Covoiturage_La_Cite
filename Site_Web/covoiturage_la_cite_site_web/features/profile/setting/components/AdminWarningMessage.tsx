/**
 * AdminWarningMessage — Message d'avertissement pour les champs modifiables par admin
 */

"use client";

import { FaTriangleExclamation } from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";
import type { AdminEditableField } from "@/features/profile/types/profile.types";
import { translations } from "../constants/vehicleTranslations";

interface AdminWarningMessageProps {
  field: AdminEditableField;
}

export function AdminWarningMessage({ field }: AdminWarningMessageProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;
  const t = isFR ? translations.fr : translations.en;

  const message = field === "licensePlate" ? t.adminWarningPlate : t.adminWarning;

  return (
    <div className="mt-2 flex items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2">
      <FaTriangleExclamation size={14} className="text-orange-500 flex-shrink-0" />
      <p className="text-xs font-medium text-orange-700">{message}</p>
    </div>
  );
}
