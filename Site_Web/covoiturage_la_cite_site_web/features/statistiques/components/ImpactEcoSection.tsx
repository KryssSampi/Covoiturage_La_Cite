"use client";

/**
 * ImpactEcoSection — grille de métriques écologiques et bouton de partage.
 */

import React from "react";
import { FaSeedling, FaChartLine, FaGasPump, FaTree, FaBus, FaMoneyBill, FaLeaf } from "react-icons/fa6";
import { useScrollReveal } from "@/shared/hooks/useScrollReveal";
import type { ImpactEco as ImpactEcoType } from "../types/statistiques.types";

// ─── Icônes par métrique ────────────────────────────────────────────────────────

const IMPACT_ICONS: { icon: React.ReactNode; color: string }[] = [
  { icon: <FaSeedling size={18} />,  color: "#0aad6a" },
  { icon: <FaChartLine size={18} />, color: "#08316e" },
  { icon: <FaGasPump size={18} />,   color: "#c8960a" },
  { icon: <FaTree size={18} />,      color: "#0aad6a" },
  { icon: <FaBus size={18} />,       color: "#0098c8" },
  { icon: <FaMoneyBill size={18} />, color: "#c8960a" },
];

// ─── Composant ──────────────────────────────────────────────────────────────

const ImpactEcoSection: React.FC<{ impact: ImpactEcoType }> = ({ impact }) => {
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>();
  const metrics = [
    { val: `${impact.co2TotalKg} kg`,     lbl: "CO₂ économisé" },
    { val: `${impact.kmTotaux} km`,        lbl: "Parcourus en cov." },
    { val: `${impact.carburantLitres} L`,  lbl: "Carburant économisé" },
    { val: `${impact.arbresEquivalents}`,  lbl: "Arbres équivalents" },
    { val: `${impact.voituresEvitees}`,    lbl: "Voitures évitées" },
    { val: `${impact.economiesDollars} $`, lbl: "Économies cumulées" },
  ];

  return (
    <div ref={ref}>
      <div className="grid grid-cols-3 gap-2.5 px-5 pt-3.5">
        {metrics.map((m, i) => (
          <div
            key={m.lbl}
            className={`scroll-reveal${isVisible ? " visible" : ""} bg-[#f0f4fb] rounded-[10px] p-3 text-center`}
            style={{ transitionDelay: `${i * 60}ms` }}
          >
            <div className="flex justify-center mb-1" style={{ color: IMPACT_ICONS[i].color }}>{IMPACT_ICONS[i].icon}</div>
            <div className="font-['Syne',sans-serif] font-extrabold text-[17px]" style={{ color: IMPACT_ICONS[i].color }}>{m.val}</div>
            <div className="text-[10px] text-[#7a90b8] mt-0.5">{m.lbl}</div>
          </div>
        ))}
      </div>
      <button
        className="mx-5 mt-3.5 mb-4 w-[calc(100%-40px)] py-2.5 rounded-lg text-[#0aad6a] font-bold text-xs cursor-pointer font-['DM_Sans',sans-serif] border-[1.5px] border-[#0aad6a] flex items-center justify-center gap-1.5 hover:bg-[rgba(10,173,106,0.08)] transition-colors"
        style={{ background: "linear-gradient(135deg,rgba(10,173,106,0.1),rgba(8,49,110,0.07))" }}
      >
        <FaLeaf size={11} /> Partager mon impact écologique sur les réseaux sociaux
      </button>
    </div>
  );
};

export default ImpactEcoSection;
