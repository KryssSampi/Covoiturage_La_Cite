"use client";

/**
 * Modale d'ajout d'un lieu favori par adresse et étiquette optionnelle.
 * Fermeture par clic sur l'arrière-plan ou le bouton Annuler.
 */

import React from "react";
import { FaMapPin, FaLightbulb, FaXmark, FaPlus } from "react-icons/fa6";

// ─── Props ───────────────────────────────────────────────────────────────────

interface AddLieuOverlayProps {
  open: boolean;
  onClose: () => void;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const AddLieuOverlay: React.FC<AddLieuOverlayProps> = ({ open, onClose }) => (
  <div
    onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    className={`fixed inset-0 z-[500] flex items-center justify-center transition-opacity duration-300 ${
      open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
    }`}
    style={{ background: "rgba(5,31,74,0.5)", backdropFilter: "blur(4px)" }}
  >
    <div
      className={`bg-white rounded-[20px] shadow-[0_20px_60px_rgba(8,49,110,0.25)] w-[460px] max-w-[92vw] ${
        open ? "animate-[slideUp_0.3s_ease]" : ""
      }`}
    >
      {/* En-tête */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[rgba(8,49,110,0.09)]">
        <div className="flex items-center gap-2 font-['Syne',sans-serif] font-extrabold text-[17px] text-[#08316e]">
          <FaMapPin className="text-[#08316e]" /> Ajouter un lieu favori
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-[30px] h-[30px] rounded-lg border-none bg-[#f0f4fb] cursor-pointer text-[#7a90b8] hover:text-[#e03050]"
        >
          <FaXmark size={14} />
        </button>
      </div>

      {/* Corps */}
      <div className="px-6 py-4">
        <div className="text-[11px] font-bold text-[#08316e] mb-2 tracking-wider">ADRESSE DU LIEU</div>
        <input
          placeholder="Ex : 801 prom. de l'Aviation, Ottawa…"
          className="w-full px-3.5 py-2.5 border-[1.5px] border-[rgba(8,49,110,0.18)] rounded-[10px] text-sm font-['DM_Sans',sans-serif] text-[#0d1f3c] bg-[#f0f4fb] outline-none focus:border-[#08316e]"
        />
        <div className="text-[11px] text-[#7a90b8] mt-1.5 leading-relaxed flex items-start gap-1.5">
          <FaLightbulb className="text-[#c8960a] shrink-0 mt-0.5" size={11} />
          Commencez à saisir — les suggestions apparaissent automatiquement via notre moteur de géolocalisation.
        </div>

        <div className="mt-4">
          <div className="text-[11px] font-bold text-[#08316e] mb-2 tracking-wider">ÉTIQUETTE (optionnel)</div>
          <input
            placeholder="Ex : Campus, Chez-moi, Gym…"
            className="w-full px-3.5 py-2.5 border-[1.5px] border-[rgba(8,49,110,0.18)] rounded-[10px] text-sm font-['DM_Sans',sans-serif] text-[#0d1f3c] bg-[#f0f4fb] outline-none focus:border-[#08316e]"
          />
        </div>
      </div>

      {/* Pied de page */}
      <div className="flex gap-2.5 px-6 pb-5 pt-3.5 border-t border-[rgba(8,49,110,0.09)]">
        <button
          onClick={onClose}
          className="px-4 py-2.5 bg-white text-[#7a90b8] border-[1.5px] border-[rgba(8,49,110,0.18)] rounded-[10px] font-semibold text-sm cursor-pointer font-['DM_Sans',sans-serif] hover:border-[#08316e]"
        >
          Annuler
        </button>
        <button
          className="flex-1 py-2.5 text-white border-none rounded-[10px] font-bold text-sm cursor-pointer font-['DM_Sans',sans-serif]"
          style={{ background: "linear-gradient(135deg,#08316e,#1a5cb0)" }}
        >
          <FaPlus className="inline mr-1.5" size={10} /> Ajouter ce lieu
        </button>
      </div>
    </div>
  </div>
);

export default AddLieuOverlay;
