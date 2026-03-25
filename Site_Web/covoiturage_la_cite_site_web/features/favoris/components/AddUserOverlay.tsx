"use client";

/**
 * Modale de recherche et d'ajout d'un utilisateur favori.
 * Filtre la liste usersSearch en temps réel selon la saisie.
 */

import React, { useState } from "react";
import { FaMagnifyingGlass, FaUserGroup, FaStar, FaCheck, FaXmark } from "react-icons/fa6";
import type { UserSearchResult } from "../types/favoris.types";

// ─── Props ───────────────────────────────────────────────────────────────────

interface AddUserOverlayProps {
  open: boolean;
  onClose: () => void;
  usersSearch: UserSearchResult[];
  /** Callback d'ajout — envoie le targetUserId au backend via la page route */
  onAdd?: (targetUserId: string) => Promise<{ ok: boolean }>;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const AddUserOverlay: React.FC<AddUserOverlayProps> = ({ open, onClose, usersSearch, onAdd }) => {
  /* État local : saisie de recherche et utilisateur sélectionné */
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedName, setSelectedName] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* Filtrage des résultats selon la saisie */
  const filtered = query.trim()
    ? usersSearch.filter(
        (u) =>
          u.name.toLowerCase().includes(query.toLowerCase()) ||
          u.id.includes(query),
      )
    : [];

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
            <FaUserGroup className="text-[#08316e]" /> Ajouter un utilisateur favori
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
          <div className="text-[11px] font-bold text-[#08316e] mb-2 tracking-wider">
            RECHERCHER UN UTILISATEUR
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Veuillez entrer le nom ou l'identifiant de l'utilisateur…"
            className="w-full px-3.5 py-2.5 border-[1.5px] border-[rgba(8,49,110,0.18)] rounded-[10px] text-sm font-['DM_Sans',sans-serif] text-[#0d1f3c] bg-[#f0f4fb] outline-none focus:border-[#08316e]"
          />
          <div className="text-[11px] text-[#7a90b8] mt-1.5 leading-relaxed">
            Les résultats apparaissent au fil de la saisie. Sélectionnez un utilisateur puis cliquez sur Ajouter.
          </div>

          {/* Liste des résultats filtrés */}
          <div className="border-[1.5px] border-[rgba(8,49,110,0.18)] rounded-[10px] overflow-hidden max-h-[230px] overflow-y-auto mt-3.5">
            {!query.trim() || filtered.length === 0 ? (
              <div className="p-5 text-center text-[#7a90b8] text-xs flex items-center justify-center gap-1.5">
                {!query.trim() ? (
                  <><FaMagnifyingGlass size={11} /> Commencez à saisir pour voir des résultats…</>
                ) : (
                  `Aucun résultat pour « ${query} »`
                )}
              </div>
            ) : (
              filtered.map((u) => (
                <div
                  key={u.id}
                  onClick={() => { setSelected(u.id); setSelectedName(u.name); }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 border-b border-[rgba(8,49,110,0.09)] cursor-pointer transition-all duration-200 ${
                    selected === u.id
                      ? "bg-[rgba(8,49,110,0.13)] border-l-[3px] border-l-[#08316e]"
                      : "border-l-[3px] border-l-transparent"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-[13px] text-white shrink-0"
                    style={{ background: u.gradient }}
                  >
                    {u.initiales}
                  </div>

                  {/* Infos utilisateur */}
                  <div className="flex-1">
                    <div className="font-semibold text-xs text-[#0d1f3c]">{u.name}</div>
                    <div className="text-[10px] text-[#7a90b8] mt-0.5 flex items-center gap-1">
                      {u.role} · <FaStar size={9} className="text-[#c8960a]" /> {u.note} · {u.badge}
                    </div>
                  </div>

                  {/* Indicateur de sélection */}
                  <span
                    className={`text-[#08316e] text-[15px] transition-opacity duration-200 ${
                      selected === u.id ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <FaCheck />
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Confirmation de la sélection */}
          {selected && (
            <div className="mt-3 px-3 py-2.5 bg-[rgba(8,49,110,0.13)] rounded-lg text-xs text-[#08316e] font-semibold flex items-center gap-1.5">
              <FaCheck size={10} /> {selectedName} sélectionné(e)
            </div>
          )}
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
            disabled={!selected || submitting}
            onClick={async () => {
              if (!selected || !onAdd || submitting) return;
              setSubmitting(true);
              try {
                const result = await onAdd(selected);
                if (result.ok) {
                  setQuery("");
                  setSelected(null);
                  setSelectedName("");
                  onClose();
                }
              } finally {
                setSubmitting(false);
              }
            }}
            className={`flex-1 py-2.5 border-none rounded-[10px] font-bold text-sm font-['DM_Sans',sans-serif] ${
              selected && !submitting
                ? "text-white cursor-pointer"
                : "text-[#7a90b8] bg-[rgba(8,49,110,0.18)] cursor-not-allowed"
            }`}
            style={selected && !submitting ? { background: "linear-gradient(135deg,#08316e,#1a5cb0)" } : undefined}
          >
            {submitting ? "Ajout…" : "Ajouter aux favoris"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserOverlay;
