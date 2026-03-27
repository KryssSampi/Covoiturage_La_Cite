"use client";

/**
 * @file CancelConfirmToast.tsx
 * @description Toast de confirmation avant annulation d'un trajet ou d'une réservation.
 * S'affiche en overlay plein écran (viewport entier) avec un fond semi-transparent
 * et propose deux boutons : "Confirmer l'annulation" et "Non, garder".
 *
 * Utilise un portail React pour s'assurer que l'overlay couvre toute la fenêtre,
 * indépendamment de la hiérarchie CSS des composants parents.
 */

import { createPortal } from "react-dom";
import { FaTriangleExclamation } from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";

interface CancelConfirmToastProps {
  /** Indique si le toast est visible */
  isOpen: boolean;
  /** Libellé du type à annuler (ex: "la réservation", "le trajet") */
  label: string;
  /** Callback déclenché lorsque l'utilisateur confirme l'annulation */
  onConfirm: () => void;
  /** Callback déclenché lorsque l'utilisateur annule l'action */
  onCancel: () => void;
}

export function CancelConfirmToast({ isOpen, label, onConfirm, onCancel }: CancelConfirmToastProps) {
  const { lang } = useAppState();
  const isFR = lang === Language.FR;

  // Ne rien rendre si fermé ou si côté serveur (SSR)
  if (!isOpen || typeof window === "undefined") return null;

  // Portail vers document.body pour garantir le recouvrement total de la fenêtre
  return createPortal(
    // Overlay plein écran — z-[9999] pour passer au-dessus de tout
    <div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      style={{ background: "rgba(8, 49, 110, 0.45)", backdropFilter: "blur(3px)" }}
      onClick={onCancel}
    >
      {/* Carte du toast */}
      <div
        className="bg-white rounded-2xl p-6 shadow-2xl max-w-sm w-[90%] text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icône d'avertissement */}
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
          <FaTriangleExclamation size={24} className="text-orange-500" />
        </div>

        {/* Titre */}
        <p className="text-lg font-bold text-[#08316e] mb-2">
          {isFR ? "Confirmer l'annulation" : "Confirm Cancellation"}
        </p>

        {/* Description */}
        <p className="text-sm text-gray-500 mb-6">
          {isFR
            ? `Êtes-vous sûr de vouloir annuler ${label} ? Cette action est irréversible.`
            : `Are you sure you want to cancel ${label}? This action is irreversible.`}
        </p>

        {/* Boutons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 transition active:scale-95"
          >
            {isFR ? "Non, garder" : "No, keep it"}
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-white bg-red-500 hover:bg-red-600 transition active:scale-95"
          >
            {isFR ? "Oui, annuler" : "Yes, cancel"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
