"use client";

/**
 * CardTransactions — historique des transactions (revenus, transit, pénalités, retraits, économies…).
 * Composant de présentation pure : toutes les données et tendances viennent des props.
 */

import React from "react";
import {
  FaCircleCheck, FaArrowsRotate, FaCircleXmark,
  FaMoneyBillTransfer, FaArrowRight, FaPiggyBank,
  FaCreditCard, FaRotateLeft, FaHourglass,
} from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import TrendMsg from "./ui/TrendMsg";
import type { Transaction, TrendMessage } from "../types/finances.types";

// ─── Props ──────────────────────────────────────────────────────────────────

export interface CardTransactionsProps {
  transactions: Transaction[];
  tendance: TrendMessage;
  colSpanClass?: string;
}

// ─── Config visuelle par type de transaction ─────────────────────────────────────
const TX_CONFIG: Record<Transaction["type"], { bg: string; icon: React.ReactNode; amtColor: string; badgeBg: string; badgeColor: string; badgeLabel: string }> = {
  revenu:        { bg: "rgba(10,173,106,0.1)",  icon: <FaCircleCheck size={14} className="text-[#0aad6a]" />,           amtColor: "#0aad6a", badgeBg: "rgba(10,173,106,0.1)",  badgeColor: "#0aad6a", badgeLabel: "Confirmé" },
  transit:       { bg: "rgba(0,152,200,0.1)",   icon: <FaArrowsRotate size={14} className="text-[#0098c8]" />,          amtColor: "#0098c8", badgeBg: "rgba(0,152,200,0.1)",   badgeColor: "#0098c8", badgeLabel: "Transit" },
  penalite:      { bg: "rgba(224,48,80,0.09)",  icon: <FaCircleXmark size={14} className="text-[#e03050]" />,            amtColor: "#e03050", badgeBg: "rgba(224,48,80,0.09)",  badgeColor: "#e03050", badgeLabel: "Pénalité" },
  retrait:       { bg: "rgba(8,49,110,0.07)",   icon: <FaMoneyBillTransfer size={14} className="text-[#08316e]" />,      amtColor: "#08316e", badgeBg: "rgba(8,49,110,0.07)",   badgeColor: "#08316e", badgeLabel: "Retrait" },
  economie:      { bg: "rgba(10,173,106,0.1)",  icon: <FaPiggyBank size={14} className="text-[#0aad6a]" />,              amtColor: "#0aad6a", badgeBg: "rgba(10,173,106,0.1)",  badgeColor: "#0aad6a", badgeLabel: "Économie" },
  paiement:      { bg: "rgba(200,150,10,0.08)", icon: <FaCreditCard size={14} className="text-[#c8960a]" />,             amtColor: "#c8960a", badgeBg: "rgba(200,150,10,0.08)", badgeColor: "#c8960a", badgeLabel: "Paiement" },
  remboursement: { bg: "rgba(0,152,200,0.1)",   icon: <FaRotateLeft size={14} className="text-[#0098c8]" />,             amtColor: "#0098c8", badgeBg: "rgba(0,152,200,0.1)",   badgeColor: "#0098c8", badgeLabel: "Remboursé" },
  holding:       { bg: "rgba(8,49,110,0.05)",   icon: <FaHourglass size={14} className="text-[#7a90b8]" />,              amtColor: "#7a90b8", badgeBg: "rgba(8,49,110,0.05)",   badgeColor: "#7a90b8", badgeLabel: "En attente" },
};

// ─── Icône de tendance par variant ──────────────────────────────────────────
const TREND_ICON: Record<TrendMessage["variant"], React.ReactNode> = {
  up:     <FaCircleCheck className="text-[#0aad6a]" />,
  down:   <FaCircleXmark className="text-[#e03050]" />,
  stable: <FaArrowsRotate className="text-[#0098c8]" />,
};

// ─── Composant ──────────────────────────────────────────────────────────────

function CardTransactions({ transactions, tendance, colSpanClass }: CardTransactionsProps) {
  return (
    <Card delay={250} className={colSpanClass}>
      <CardHeader
        dotColor="#0aad6a"
        title="Historique des Transactions"
        right={
          <span className="text-[#08316e] text-[11px] cursor-pointer font-semibold flex items-center gap-1">
            Voir tout <FaArrowRight size={9} />
          </span>
        }
      />
      <div className="px-5 pb-3">
        {transactions.map((tx, i) => {
          const cfg = TX_CONFIG[tx.type];
          return (
            <div
              key={tx.id}
              className="flex items-center gap-3 py-3"
              style={{ borderBottom: i < transactions.length - 1 ? "1px solid rgba(8,49,110,0.05)" : "none" }}
            >
              <div className="w-9 h-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
                {cfg.icon}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-xs">{tx.description}</div>
                <div className="text-[10px] text-[#7a90b8] mt-0.5">{tx.date}</div>
              </div>
              <div className="text-right">
                <div className="font-[Syne] font-extrabold text-sm" style={{ color: cfg.amtColor }}>
                  {tx.montant > 0 ? "-" : ""}{tx.montant.toFixed(2)} $
                </div>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-[5px] mt-0.5 inline-block"
                  style={{ background: cfg.badgeBg, color: cfg.badgeColor }}
                >
                  {cfg.badgeLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      {/* Message de tendance dynamique */}
      <TrendMsg variant={tendance.variant} icon={TREND_ICON[tendance.variant]}>
        <strong>{tendance.texteBold}</strong>{" "}
        {tendance.texte}
      </TrendMsg>
    </Card>
  );
}

export default CardTransactions;
