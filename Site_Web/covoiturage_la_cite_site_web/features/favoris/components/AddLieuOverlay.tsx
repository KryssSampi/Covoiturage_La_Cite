"use client";

/**
 * Modale d'ajout d'un lieu favori par adresse et étiquette optionnelle.
 * Intègre les suggestions d'adresse via Photon (OpenStreetMap).
 * Fermeture par clic sur l'arrière-plan ou le bouton Annuler.
 */

import React, { useState, useRef, useCallback } from "react";
import { FaMapPin, FaLightbulb, FaXmark, FaPlus } from "react-icons/fa6";
import { getProposals } from "@/core/services/location.suggestion";

// ─── Props ───────────────────────────────────────────────────────────────────

interface AddLieuOverlayProps {
  open: boolean;
  onClose: () => void;
  /** Callback d'ajout — envoie les données au backend via la page route */
  onAdd?: (data: { adresse: string; pseudonyme: string; iconTag: string; coordonnees: { lat: number; lng: number } }) => Promise<{ ok: boolean }>;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const AddLieuOverlay: React.FC<AddLieuOverlayProps> = ({ open, onClose, onAdd }) => {
  const [adresse, setAdresse] = useState("");
  const [etiquette, setEtiquette] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [suggestions, setSuggestions] = useState<{ label: string; coordinates: [number, number] }[]>([]);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Recherche de suggestions avec debounce de 300ms */
  const handleAdresseChange = useCallback((value: string) => {
    setAdresse(value);
    // Réinitialiser les coordonnées quand l'utilisateur retape
    setCoords({ lat: 0, lng: 0 });

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await getProposals(value.trim());
        setSuggestions(results);
      } catch (err) {
        console.error('[AddLieuOverlay] getProposals', err);
        setSuggestions([]);
      }
    }, 300);
  }, []);

  /** Sélectionner une suggestion — remplir l'adresse et les coordonnées */
  const handleSelectSuggestion = (suggestion: { label: string; coordinates: [number, number] }) => {
    setAdresse(suggestion.label);
    // Photon retourne [lng, lat], on convertit en {lat, lng}
    setCoords({ lat: suggestion.coordinates[1], lng: suggestion.coordinates[0] });
    setSuggestions([]);
  };

  /** Soumettre l'ajout puis fermer l'overlay */
  const handleSubmit = async () => {
    if (!adresse.trim() || !onAdd || submitting) return;
    setSubmitting(true);
    try {
      const result = await onAdd({
        adresse: adresse.trim(),
        pseudonyme: etiquette.trim() || adresse.trim().split(",")[0],
        iconTag: "autre",
        coordonnees: coords,
      });
      if (result.ok) {
        setAdresse("");
        setEtiquette("");
        setCoords({ lat: 0, lng: 0 });
        setSuggestions([]);
        onClose();
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
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
        <div className="relative">
          <input
            value={adresse}
            onChange={(e) => handleAdresseChange(e.target.value)}
            placeholder="Ex : 801 prom. de l'Aviation, Ottawa…"
            className="w-full px-3.5 py-2.5 border-[1.5px] border-[rgba(8,49,110,0.18)] rounded-[10px] text-sm font-['DM_Sans',sans-serif] text-[#0d1f3c] bg-[#f0f4fb] outline-none focus:border-[#08316e]"
          />
          {/* Liste déroulante des suggestions */}
          {suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-[rgba(8,49,110,0.15)] rounded-[10px] shadow-lg z-10 max-h-[200px] overflow-y-auto list-none p-0 m-0">
              {suggestions.map((s, i) => (
                <li key={i}>
                  <button
                    type="button"
                    onClick={() => handleSelectSuggestion(s)}
                    className="w-full text-left px-3.5 py-2.5 text-sm text-[#0d1f3c] font-['DM_Sans',sans-serif] bg-transparent border-none cursor-pointer hover:bg-[#f0f4fb] transition-colors"
                  >
                    <FaMapPin className="inline mr-1.5 text-[#08316e]" size={10} />
                    {s.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="text-[11px] text-[#7a90b8] mt-1.5 leading-relaxed flex items-start gap-1.5">
          <FaLightbulb className="text-[#c8960a] shrink-0 mt-0.5" size={11} />
          Commencez à saisir — les suggestions apparaissent automatiquement via notre moteur de géolocalisation.
        </div>

        <div className="mt-4">
          <div className="text-[11px] font-bold text-[#08316e] mb-2 tracking-wider">ÉTIQUETTE (optionnel)</div>
          <input
            value={etiquette}
            onChange={(e) => setEtiquette(e.target.value)}
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
          onClick={handleSubmit}
          disabled={!adresse.trim() || submitting}
          className={`flex-1 py-2.5 text-white border-none rounded-[10px] font-bold text-sm cursor-pointer font-['DM_Sans',sans-serif] ${submitting ? 'opacity-60' : ''}`}
          style={{ background: "linear-gradient(135deg,#08316e,#1a5cb0)" }}
        >
          <FaPlus className="inline mr-1.5" size={10} /> {submitting ? "Ajout…" : "Ajouter ce lieu"}
        </button>
      </div>
    </div>
  </div>
  );
};

export default AddLieuOverlay;
