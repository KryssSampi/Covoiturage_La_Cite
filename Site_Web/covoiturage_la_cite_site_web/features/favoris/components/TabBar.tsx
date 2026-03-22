"use client";

/**
 * Barre d'onglets principale pour la page Favoris :
 * Lieux | Utilisateurs | Alertes avec badges numériques.
 */

import React from "react";
import { FaMapPin, FaUserGroup, FaBell } from "react-icons/fa6";
import { Language, useAppState } from "@/core/state/app_state";

// ─── Props ───────────────────────────────────────────────────────────────────

interface TabBarProps {
  active: string;
  onChange: (v: string) => void;
  counts: { lieux: number; utilisateurs: number; alertes: number };
}

// ─── Composant ───────────────────────────────────────────────────────────────

const TabBar: React.FC<TabBarProps> = ({ active, onChange, counts }) => {
  const appState = useAppState();
  const isFR = appState.lang === Language.FR;

  const tabs = [
    { id: "lieux",        icon: <FaMapPin />,    label: isFR ? "Lieux" : "Places",          badge: counts.lieux,        badgeColor: "#08316e" },
    { id: "utilisateurs", icon: <FaUserGroup />, label: isFR ? "Utilisateurs" : "Users",   badge: counts.utilisateurs, badgeColor: "#0aad6a" },
    { id: "alertes",      icon: <FaBell />,       label: isFR ? "Alertes" : "Alerts",       badge: counts.alertes,      badgeColor: "#c8960a" },
  ];

  return (
    <div className="flex gap-1.5 mt-5">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-200 font-['DM_Sans',sans-serif] ${
            active === t.id
              ? "bg-white text-[#08316e] border-none"
              : "bg-[rgba(255,255,255,0.12)] text-[rgba(255,255,255,0.75)] border border-[rgba(255,255,255,0.2)]"
          }`}
        >
          {t.icon}
          {t.label}
          {/* Badge avec nombre */}
          <span
            className="inline-flex items-center justify-center w-[17px] h-[17px] rounded-full text-[9px] font-bold text-white"
            style={{ background: active === t.id ? t.badgeColor : "rgba(255,255,255,0.25)" }}
          >
            {t.badge}
          </span>
        </button>
      ))}
    </div>
  );
};

export default TabBar;
