"use client";

/**
 * CardSolde — affiche le solde disponible (conducteur) ou les économies estimées (passager).
 * Le bouton Retirer est masqué pour les passagers.
 * Les sous-textes en transit et pénalités sont dynamiques.
 */

import React from "react";
import { FaMoneyBillTransfer, FaClipboardList } from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import type { TrendMessage } from "../types/finances.types";

// ─── Props ──────────────────────────────────────────────────────────────────

export interface CardSoldeProps {
  solde: number;
  transit: number;
  penalites: number;
  isDriver: boolean;
  nbTrajetsEnCours: number;
  nbPenalitesActives: number;
  tendance: TrendMessage;
  onRetirer?: () => void;
  onHistorique?: () => void;
}

function CardSolde({
  solde,
  transit,
  penalites,
  isDriver,
  nbTrajetsEnCours,
  nbPenalitesActives,
  onRetirer,
  onHistorique,
}: CardSoldeProps) {
  const titre = isDriver ? "Solde Disponible" : "Économies Estimées";
  const sousTitre = isDriver
    ? "Disponible pour retrait · Seuil min. 20 $"
    : "Économies vs transport individuel";

  return (
    <Card delay={50} >
      <CardHeader dotColor="#0aad6a" title={titre} />
      <div className="text-center py-6 px-5">
        <div className="text-[11px] text-[#7a90b8] tracking-wider uppercase font-semibold">{titre}</div>
        <div className="font-[Syne] font-extrabold text-[46px] text-[#0aad6a] my-2">{solde.toFixed(2)} $</div>
        <div className="text-xs text-[#7a90b8]">{sousTitre}</div>
        <div className="flex gap-2.5 justify-center mt-4.5">
          {/* Bouton Retirer — masqué pour les passagers */}
          {isDriver && (
            <button
              onClick={onRetirer}
              className="btn-finance px-5.5 py-2.5 text-white border-none rounded-[9px] font-bold text-[13px] cursor-pointer font-['DM_Sans'] flex items-center gap-2"
              style={{ background: "linear-gradient(135deg,#08316e,#1a5cb0)" }}
            >
              <FaMoneyBillTransfer size={13} /> Retirer
            </button>
          )}
          <button
            onClick={onHistorique}
            className="btn-finance px-5.5 py-2.5 bg-white text-[#08316e] border-[1.5px] border-[#08316e] rounded-[9px] font-bold text-[13px] cursor-pointer font-['DM_Sans'] flex items-center gap-2"
          >
            <FaClipboardList size={13} /> Historique
          </button>
        </div>
      </div>
      {/* KPI transit + pénalités */}
      <div className="grid grid-cols-2 gap-px bg-[rgba(8,49,110,0.09)] border-t border-[rgba(8,49,110,0.09)]">
        <div className="bg-white p-3.5">
          <div className="text-[10px] text-[#7a90b8] uppercase tracking-wide mb-1">
            {isDriver ? "En Transit" : "Fonds en transit"}
          </div>
          <div className="font-[Syne] font-extrabold text-[21px] text-[#0098c8]">{transit.toFixed(2)} $</div>
          <div className="text-[10px] text-[#7a90b8] mt-0.5">
            {nbTrajetsEnCours > 0 ? `${nbTrajetsEnCours} trajet${nbTrajetsEnCours > 1 ? "s" : ""} en cours` : "Aucun trajet en cours"}
          </div>
        </div>
        {isDriver && (
          <div className="bg-white p-3.5">
            <div className="text-[10px] text-[#7a90b8] uppercase tracking-wide mb-1">Pénalités</div>
            <div className="font-[Syne] font-extrabold text-[21px] text-[#e03050]">−{Math.abs(penalites).toFixed(2)} $</div>
            <div className="text-[10px] text-[#7a90b8] mt-0.5">
              {nbPenalitesActives > 0 ? `${nbPenalitesActives} active${nbPenalitesActives > 1 ? "s" : ""}` : "Aucune pénalité"}
            </div>
          </div>
        )}
        {!isDriver && (
          <div className="bg-white p-3.5">
            <div className="text-[10px] text-[#7a90b8] uppercase tracking-wide mb-1">Total dépensé</div>
            <div className="font-[Syne] font-extrabold text-[21px] text-[#08316e]">{transit.toFixed(2)} $</div>
            <div className="text-[10px] text-[#7a90b8] mt-0.5">Sur la plateforme</div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default CardSolde;
