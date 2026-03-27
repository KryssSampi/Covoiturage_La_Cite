"use client";

import { createPortal } from "react-dom";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";

import { Language, useAppState } from "@/core/state/app_state";

interface ReservationRequestToastProps {
  isOpen: boolean;
  success: boolean;
  message: string;
  onOk: () => void;
  okLabel?: string;
  titleOverride?: string;
  bodyOverride?: string;
}

export function ReservationRequestToast({
  isOpen,
  success,
  message,
  onOk,
  okLabel,
  titleOverride,
  bodyOverride,
}: ReservationRequestToastProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  if (!isOpen || typeof window === "undefined") return null;

  const iconBg = success ? "bg-green-100" : "bg-amber-100";
  const iconColor = success ? "text-green-600" : "text-amber-600";
  const btnBg = success ? "bg-[#08316e] hover:bg-[#0a4a9e]" : "bg-gray-600 hover:bg-gray-700";

  const title = titleOverride ?? (
    success
      ? (isFR ? "Demande envoyee !" : "Request sent!")
      : (isFR ? "Demande non envoyee" : "Request failed")
  );

  const body = bodyOverride ?? (
    success
      ? (
          isFR
            ? "Le conducteur va traiter votre demande. Vous serez notifie des qu'il accepte ou refuse."
            : "The driver will process your request. You will be notified once they accept or decline."
        )
      : message
  );

  const btnLabel = okLabel ?? (
    success
      ? (isFR ? "Voir mon planning" : "View my schedule")
      : (isFR ? "Fermer" : "Close")
  );

  return createPortal(
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      style={{ background: "rgba(8, 49, 110, 0.45)", backdropFilter: "blur(3px)" }}
      onClick={onOk}
    >
      <div
        className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-[90%] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-4`}>
          {success
            ? <FaCheck size={22} className={iconColor} />
            : <FaExclamationTriangle size={20} className={iconColor} />}
        </div>

        <p className="text-lg font-bold text-[#08316e] mb-3">{title}</p>
        <p className="text-sm text-gray-600 mb-5">{body}</p>

        <button
          onClick={onOk}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm text-white ${btnBg} transition active:scale-95`}
        >
          {btnLabel}
        </button>
      </div>
    </div>,
    document.body,
  );
}
