"use client";

/**
 * Carte d'un utilisateur favori (conducteur ou passager) :
 * avatar, note, badges, stats et bascule d'alerte personnelle.
 */

import React, { useState } from "react";
import { FaBell } from "react-icons/fa6";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import type { UtilisateurFavori } from "../types/favoris.types";
import { Language, useAppState } from "@/core/state/app_state";

// ─── Props ───────────────────────────────────────────────────────────────────

interface UserCardProps {
  user: UtilisateurFavori;
  delay?: number;
}

// ─── Composant ───────────────────────────────────────────────────────────────

const UserCard: React.FC<UserCardProps> = ({ user, delay = 0 }) => {
  /* État local : alerte de disponibilité active ou non */
  const [alertOn, setAlertOn] = useState(user.alerteActive);
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>({ threshold: 0.1 });
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  return (
    <div
      ref={ref}
      className={`scroll-reveal${isVisible ? " visible" : ""} flex items-center gap-3 p-3 bg-[#f0f4fb] rounded-[10px] border border-[rgba(8,49,110,0.09)] transition-all duration-200`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Avatar avec indicateur en ligne */}
      <div
        className="relative w-11 h-11 rounded-full flex items-center justify-center font-bold text-[15px] text-white shrink-0"
        style={{ background: user.avatarGradient }}
      >
        {user.initiales}
        <span
          className={`absolute bottom-[1px] right-[1px] w-2.5 h-2.5 rounded-full border-2 border-white ${
            user.estEnLigne ? "bg-[#0aad6a]" : "bg-[#7a90b8]"
          }`}
        />
      </div>

      {/* Informations principales */}
      <div className="flex-1">
        <div className="font-bold text-[13px] text-[#0d1f3c]">{user.nomComplet}</div>
        <div className="text-[#7a90b8] text-[11px] mt-0.5 flex gap-1.5 items-center">
          <span className="text-[#c8960a] text-[10px]">
            {"★".repeat(Math.round(user.note))}
          </span>
          {user.note}/5 · {user.niveau}
        </div>

        {/* Badges de l'utilisateur */}
        {user.badges.length > 0 && (
          <div className="flex gap-1 mt-1 flex-wrap">
            {user.badges.map((b) => (
              <span
                key={b}
                className="text-[9px] px-1.5 py-0.5 rounded-[5px] bg-[rgba(200,150,10,0.09)] text-[#c8960a] font-semibold"
              >
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Statistiques de co-voiturage */}
        <div className="flex gap-3 mt-1.5">
          {[
            { v: user.nbTrajetsEnsemble,      l: isFR ? "Trajets ens." : "Trips tog." },
            { v: user.nbTrajetsEnsembleMois,  l: isFR ? "Ce mois" : "This month" },
          ].map((s) => (
            <div key={s.l}>
              <div className="font-['Syne',sans-serif] font-extrabold text-[13px] text-[#08316e]">{s.v}</div>
              <div className="text-[9px] text-[#7a90b8]">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Zone droite : rôle + bouton alerte */}
      <div className="flex flex-col gap-1.5 items-end shrink-0">
        <span
          className={`text-[9px] font-bold px-2 py-0.5 rounded-[5px] tracking-wide ${
            user.role === "conducteur"
              ? "bg-[rgba(8,49,110,0.13)] text-[#08316e]"
              : "bg-[rgba(10,173,106,0.1)] text-[#0aad6a]"
          }`}
        >
          {user.role === "conducteur" ? (isFR ? "Conducteur" : "Driver") : (isFR ? "Passager" : "Passenger")}
        </span>
        <button
          onClick={() => setAlertOn(!alertOn)}
          className={`flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-[7px] cursor-pointer transition-all duration-200 font-semibold font-['DM_Sans',sans-serif] border-[1.5px] ${
            alertOn
              ? "border-[#0aad6a] text-[#0aad6a] bg-[rgba(10,173,106,0.1)]"
              : "border-[rgba(8,49,110,0.09)] text-[#7a90b8] bg-transparent"
          }`}
        >
          <FaBell size={10} />
          {alertOn ? (isFR ? "Alerté" : "Alerted") : (isFR ? "Alerter" : "Alert")}
        </button>
      </div>
    </div>
  );
};

export default UserCard;
