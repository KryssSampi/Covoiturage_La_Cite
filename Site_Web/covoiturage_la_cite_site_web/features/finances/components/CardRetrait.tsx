"use client";

/**
 * CardRetrait — simulation de retrait vers un IBAN enregistré (conducteurs seulement).
 */

import React, { useState } from "react";
import { FaTriangleExclamation, FaCreditCard } from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";

function CardRetrait({ ibanMasque }: { ibanMasque: string }) {
  const [amount, setAmount] = useState("148.25");

  return (
    <Card delay={300} className="md:col-span-3">
      <CardHeader
        dotColor="#c8960a"
        title="Retrait Simulé"
        right={<span className="text-[11px] text-[#7a90b8]">Simulation uniquement — aucun vrai transfert</span>}
      />
      <div
        className="mx-5 my-3.5 p-4 rounded-xl border-[1.5px] border-[#0aad6a]"
        style={{ background: "linear-gradient(135deg,rgba(10,173,106,0.06),rgba(8,49,110,0.06))" }}
      >
        <div className="font-[Syne] font-bold text-sm text-[#0aad6a] mb-2.5 flex items-center gap-2">
          <FaCreditCard size={14} /> Retrait vers votre compte enregistré
        </div>
        {/* IBAN masqué */}
        <div className="bg-[rgba(8,49,110,0.05)] rounded-lg px-3 py-2.5 text-xs text-[#7a90b8] flex justify-between items-center mb-3">
          <span>IBAN enregistré :</span>
          <strong className="text-[#0d1f3c]">{ibanMasque}</strong>
          <span className="text-[#08316e] cursor-pointer text-[11px] font-semibold">Modifier →</span>
        </div>
        {/* Input montant + boutons */}
        <div className="flex gap-2.5 items-center">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-[#f0f4fb] border-[1.5px] border-[rgba(8,49,110,0.18)] rounded-[9px] px-3.5 py-2.5 text-[#0d1f3c] text-base font-[Syne] font-bold outline-none"
          />
          <button
            className="px-5.5 py-2.5 text-white border-none rounded-[9px] font-bold text-[13px] cursor-pointer font-['DM_Sans'] whitespace-nowrap"
            style={{ background: "linear-gradient(135deg,#08316e,#1a5cb0)" }}
          >
            Simuler le retrait
          </button>
          <button className="px-5.5 py-2.5 bg-white text-[#08316e] border-[1.5px] border-[#08316e] rounded-[9px] font-bold text-[13px] cursor-pointer font-['DM_Sans'] whitespace-nowrap">
            Retrait max.
          </button>
        </div>
        <div className="mt-2 text-[10px] text-[#7a90b8] flex items-center gap-1">
          <FaTriangleExclamation size={9} className="text-[#c8960a]" />
          Solde min. 20.00 $ · Pénalités déduites automatiquement · Confirmation par email
        </div>
      </div>
    </Card>
  );
}

export default CardRetrait;
