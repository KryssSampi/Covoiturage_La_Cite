"use client";

/**
 * CardSolde — affiche le solde disponible, le transit et les pénalités.
 * Le bouton Retirer est masqué pour les passagers.
 */

import React from "react";
import { FaMoneyBillTransfer, FaClipboardList } from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";

// ─── Composant ──────────────────────────────────────────────────────────────

export interface CardSoldeProps {
  solde: number;
  transit: number;
  penalites: number;
  isDriver: boolean;
}

function CardSolde({ solde, transit, penalites, isDriver }: CardSoldeProps) {
  return (
    <Card delay={50}>
      <CardHeader dotColor="#0aad6a" title="Solde Disponible" />
      <div className="text-center py-6 px-5">
        <div className="text-[11px] text-[#7a90b8] tracking-wider uppercase font-semibold">Solde Disponible</div>
        <div className="font-[Syne] font-extrabold text-[46px] text-[#0aad6a] my-2">{solde.toFixed(2)} $</div>
        <div className="text-xs text-[#7a90b8]">Disponible pour retrait · Seuil min. 20 $</div>
        <div className="flex gap-2.5 justify-center mt-4.5">
          {/* Bouton Retirer — masqué pour les passagers */}
          {isDriver && (
            <button
              className="px-5.5 py-2.5 text-white border-none rounded-[9px] font-bold text-[13px] cursor-pointer font-['DM_Sans'] flex items-center gap-2"
              style={{ background: "linear-gradient(135deg,#08316e,#1a5cb0)" }}
            >
              <FaMoneyBillTransfer size={13} /> Retirer
            </button>
          )}
          <button className="px-5.5 py-2.5 bg-white text-[#08316e] border-[1.5px] border-[#08316e] rounded-[9px] font-bold text-[13px] cursor-pointer font-['DM_Sans'] flex items-center gap-2">
            <FaClipboardList size={13} /> Historique
          </button>
        </div>
      </div>
      {/* KPI transit + pénalités */}
      <div className="grid grid-cols-2 gap-px bg-[rgba(8,49,110,0.09)] border-t border-[rgba(8,49,110,0.09)]">
        <div className="bg-white p-3.5">
          <div className="text-[10px] text-[#7a90b8] uppercase tracking-wide mb-1">En Transit</div>
          <div className="font-[Syne] font-extrabold text-[21px] text-[#0098c8]">{transit.toFixed(2)} $</div>
          <div className="text-[10px] text-[#7a90b8] mt-0.5">1 trajet en cours</div>
        </div>
        <div className="bg-white p-3.5">
          <div className="text-[10px] text-[#7a90b8] uppercase tracking-wide mb-1">Pénalités</div>
          <div className="font-[Syne] font-extrabold text-[21px] text-[#e03050]">−{Math.abs(penalites).toFixed(2)} $</div>
          <div className="text-[10px] text-[#7a90b8] mt-0.5">2 actives</div>
        </div>
      </div>
    </Card>
  );
}

export default CardSolde;
