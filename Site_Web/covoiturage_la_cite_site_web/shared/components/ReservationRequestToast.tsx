"use client";

/**
 * @file ReservationRequestToast.tsx
 * @description Toast affiché côté passager après l'envoi d'une demande de réservation.
 *
 * Succès → message de confirmation + bouton OK → redirection vers le planificateur.
 * Erreur → message d'erreur serveur + bouton Fermer.
 */

import { createPortal } from "react-dom";
import { FaCheck, FaExclamationTriangle } from "react-icons/fa";
import { Language, useAppState } from "@/core/state/app_state";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ReservationRequestToastProps {
  isOpen: boolean;
  /** true = demande envoyée avec succès, false = erreur */
  success: boolean;
  /** Message affiché (id de réservation en succès, message d'erreur en échec) */
  message: string;
  /** Callback déclenché sur OK (succès) ou Fermer (erreur) */
  onOk: () => void;
  /** Label personnalisé du bouton OK (remplace le défaut "Voir mon planning") */
  okLabel?: string;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export function ReservationRequestToast({
  isOpen,
  success,
  message,
  onOk,
  okLabel,
}: ReservationRequestToastProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  if (!isOpen || typeof window === "undefined") return null;

  const iconBg    = success ? "bg-green-100" : "bg-amber-100";
  const iconColor = success ? "text-green-600" : "text-amber-600";
  const btnBg     = success
    ? "bg-[#08316e] hover:bg-[#0a4a9e]"
    : "bg-gray-600 hover:bg-gray-700";

  const title = success
    ? (isFR ? "Demande envoyée !" : "Request sent!")
    : (isFR ? "Demande non envoyée" : "Request failed");

  const body = success
    ? (isFR
        ? "Le conducteur va traiter votre demande. Vous serez notifié dès qu'il accepte ou refuse."
        : "The driver will process your request. You will be notified once they accept or decline.")
    : message;

  const btnLabel = okLabel
    ?? (success
      ? (isFR ? "Voir mon planning" : "View my schedule")
      : (isFR ? "Fermer" : "Close"));

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
        {/* Icône */}
        <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-4`}>
          {success
            ? <FaCheck size={22} className={iconColor} />
            : <FaExclamationTriangle size={20} className={iconColor} />
          }
        </div>

        {/* Titre */}
        <p className="text-lg font-bold text-[#08316e] mb-3">{title}</p>

        {/* Corps */}
        <p className="text-sm text-gray-600 mb-5">{body}</p>

        {/* Bouton */}
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
