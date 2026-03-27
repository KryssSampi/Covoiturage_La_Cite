"use client";

/**
 * @file ReservationDecisionToast.tsx
 * @description Toast de confirmation pour accepter ou refuser une demande de réservation.
 * Affiche les détails de la demande (nom, trajet, date, heure) et propose
 * deux boutons : "Ok" (exécute la décision) et "Annuler" (ferme le toast).
 *
 * Utilise un portail React pour s'afficher par-dessus tout le contenu.
 */

import { createPortal } from "react-dom";
import { FaCheck, FaTimes } from "react-icons/fa";
import { Language, useAppState } from "@/core/state/app_state";
import { formatDate } from "@/core/utils/date.utils";

// ─── Types ───────────────────────────────────────────────────────────────────

/** Type de décision affichée dans le toast */
export type DecisionType = "accept" | "reject";

/** Détails de la demande à afficher dans le toast */
export interface DecisionDetails {
  /** Nom du passager demandeur */
  applicantName: string;
  /** Lieu de départ du trajet */
  departure: string;
  /** Lieu d'arrivée du trajet */
  destination: string;
  /** Date du trajet au format ISO "YYYY-MM-DD" */
  date: string;
  /** Heure du trajet "HH:mm" */
  time: string;
}

interface ReservationDecisionToastProps {
  /** Indique si le toast est visible */
  isOpen: boolean;
  /** Type de décision : accepter ou refuser */
  decision: DecisionType;
  /** Détails de la demande à afficher */
  details: DecisionDetails;
  /** Callback déclenché lorsque l'utilisateur confirme la décision */
  onConfirm: () => void;
  /** Callback déclenché lorsque l'utilisateur annule (ferme le toast) */
  onCancel: () => void;
}

// ─── Composant ───────────────────────────────────────────────────────────────

export function ReservationDecisionToast({
  isOpen,
  decision,
  details,
  onConfirm,
  onCancel,
}: ReservationDecisionToastProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  // Ne rien rendre si fermé ou côté serveur (SSR)
  if (!isOpen || typeof window === "undefined") return null;

  const isAccept = decision === "accept";

  // Couleurs et libellés selon la décision
  const iconBg    = isAccept ? "bg-green-100" : "bg-red-100";
  const iconColor = isAccept ? "text-green-600" : "text-red-600";
  const btnBg     = isAccept ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700";
  const title     = isAccept
    ? (isFR ? "Accepter la demande ?" : "Accept request?")
    : (isFR ? "Refuser la demande ?" : "Decline request?");

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "rgba(8, 49, 110, 0.45)", backdropFilter: "blur(3px)" }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl p-6 shadow-2xl max-w-md w-[90%] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icône */}
        <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center mx-auto mb-4`}>
          {isAccept
            ? <FaCheck size={22} className={iconColor} />
            : <FaTimes size={22} className={iconColor} />
          }
        </div>

        {/* Titre */}
        <p className="text-lg font-bold text-[#08316e] mb-4">{title}</p>

        {/* Détails de la demande */}
        <div className="text-left bg-gray-50 rounded-xl p-4 mb-4 space-y-1">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{isFR ? "Passager" : "Passenger"} :</span>{" "}
            {details.applicantName}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{isFR ? "Trajet" : "Trip"} :</span>{" "}
            {details.departure} → {details.destination}
          </p>
          <p className="text-sm text-gray-700">
            <span className="font-semibold">{isFR ? "Date" : "Date"} :</span>{" "}
            {formatDate(details.date, lang)} — {details.time}
          </p>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition active:scale-95"
          >
            {isFR ? "Annuler" : "Cancel"}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-sm text-white ${btnBg} transition active:scale-95`}
          >
            {isFR ? "Ok" : "Ok"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
