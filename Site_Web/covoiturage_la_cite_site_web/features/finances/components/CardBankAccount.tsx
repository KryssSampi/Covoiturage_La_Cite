"use client";

/**
 * CardBankAccount — Section de test pour afficher et manipuler
 * le compte bancaire simulé d'un utilisateur.
 *
 * ⚠️  USAGE TEST UNIQUEMENT — À retirer avant la mise en production.
 * Affiche le solde, le montant en transit, les dernières transactions
 * et permet de simuler un dépôt ou de déclencher un retrait.
 */

import React, { useEffect, useState, useCallback } from "react";
import { FaLandmark, FaArrowDown, FaArrowUp, FaRotate, FaTriangleExclamation } from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import type { BankAccountModel, BankAccountTransaction } from "@/core/models/BankAccountModel";

// ─── Types ───────────────────────────────────────────────────────────────────

interface CardBankAccountProps {
  /** Identifiant de l'utilisateur dont on affiche le compte */
  userId: string;
  /** Si vrai, affiche le bouton de retrait conducteur vers ce compte */
  isDriver?: boolean;
}

// ─── Couleur par type de transaction ─────────────────────────────────────────

function txnColor(type: BankAccountTransaction["type"]): string {
  switch (type) {
    case "depot":            return "#0aad6a";
    case "transit_entrant":  return "#0098c8";
    case "transit_sortant":  return "#e03050";
    case "retrait":          return "#c8960a";
    default:                 return "#7a90b8";
  }
}

function txnSign(type: BankAccountTransaction["type"]): "+" | "−" {
  return type === "depot" || type === "transit_entrant" ? "+" : "−";
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function CardBankAccount({ userId, isDriver = false }: CardBankAccountProps) {
  const [account, setAccount]       = useState<BankAccountModel | null>(null);
  const [loading, setLoading]       = useState(true);
  const [depositAmount, setDeposit] = useState("100");
  const [feedback, setFeedback]     = useState<{ msg: string; ok: boolean } | null>(null);
  const [busy, setBusy]             = useState(false);

  // ── Chargement du compte ──────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/payment/bank-account?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json() as BankAccountModel;
        setAccount(data);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { void load(); }, [load]);

  // ── Simuler un dépôt de test ─────────────────────────────────────────────
  async function handleDeposit() {
    setBusy(true);
    setFeedback(null);
    try {
      const montant = parseFloat(depositAmount);
      if (isNaN(montant) || montant <= 0) {
        setFeedback({ msg: "Montant invalide", ok: false });
        return;
      }
      const res = await fetch("/api/payment/deposit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, montant, description: "Dépôt de test" }),
      });
      const data = await res.json() as { message?: string; error?: string };
      setFeedback({ msg: data.message ?? data.error ?? "Erreur", ok: res.ok });
      if (res.ok) await load();
    } finally {
      setBusy(false);
    }
  }

  // ── Retrait conducteur → compte bancaire ─────────────────────────────────
  async function handleWithdraw() {
    setBusy(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/payment/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ driverId: userId }),
      });
      const data = await res.json() as { message?: string; error?: string; montantRetire?: number };
      setFeedback({
        msg: res.ok ? `${data.message ?? "Retrait effectué"} (${(data.montantRetire ?? 0).toFixed(2)} $)` : (data.error ?? "Erreur"),
        ok: res.ok,
      });
      if (res.ok) await load();
    } finally {
      setBusy(false);
    }
  }

  // ── Rendu chargement ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <Card delay={400} className="md:col-span-3">
        <CardHeader dotColor="#c8960a" title="Compte Bancaire Simulé (TEST)" />
        <div className="p-6 text-center text-sm text-[#7a90b8]">Chargement du compte bancaire…</div>
      </Card>
    );
  }

  if (!account) {
    return (
      <Card delay={400} className="md:col-span-3">
        <CardHeader dotColor="#c8960a" title="Compte Bancaire Simulé (TEST)" />
        <div className="p-6 text-center text-sm text-[#e03050]">Compte bancaire introuvable pour cet utilisateur.</div>
      </Card>
    );
  }

  // ── Trie les transactions (plus récentes en premier) ─────────────────────
  const sortedTxns = [...account.transactions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 8);

  return (
    <Card delay={400} className="md:col-span-3">
      <CardHeader
        dotColor="#c8960a"
        title="Compte Bancaire Simulé (TEST)"
        right={
          <span className="text-[11px] text-[#7a90b8] flex items-center gap-1">
            <FaTriangleExclamation size={10} className="text-[#c8960a]" />
            Section de test — données simulées
          </span>
        }
      />

      {/* ── KPI solde + transit ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-[rgba(8,49,110,0.09)] border-b border-[rgba(8,49,110,0.09)]">
        <div className="bg-white p-4">
          <div className="text-[10px] text-[#7a90b8] uppercase tracking-wide mb-1">Solde disponible</div>
          <div className="font-[Syne] font-extrabold text-[26px] text-[#0aad6a]">
            {account.soldeDisponible.toFixed(2)} $
          </div>
        </div>
        <div className="bg-white p-4">
          <div className="text-[10px] text-[#7a90b8] uppercase tracking-wide mb-1">En transit</div>
          <div className="font-[Syne] font-extrabold text-[26px] text-[#0098c8]">
            {account.montantEnTransit.toFixed(2)} $
          </div>
        </div>
        <div className="bg-white p-4">
          <div className="text-[10px] text-[#7a90b8] uppercase tracking-wide mb-1">Banque</div>
          <div className="font-[Syne] font-bold text-[15px] text-[#0d1f3c] flex items-center gap-2">
            <FaLandmark size={13} className="text-[#7a90b8]" />
            {account.nomBanque}
          </div>
        </div>
        <div className="bg-white p-4">
          <div className="text-[10px] text-[#7a90b8] uppercase tracking-wide mb-1">IBAN</div>
          <div className="font-mono text-[13px] text-[#0d1f3c] font-semibold">{account.ibanMasque}</div>
        </div>
      </div>

      {/* ── Actions de test ─────────────────────────────────────────────────── */}
      <div className="mx-5 my-4 p-4 rounded-xl border-[1.5px] border-[rgba(8,49,110,0.15)] bg-[rgba(200,150,10,0.04)]">
        <div className="text-xs font-bold text-[#c8960a] mb-3 uppercase tracking-wider">
          Actions de test
        </div>
        <div className="flex flex-wrap gap-3 items-end">
          {/* Dépôt de test */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-[#7a90b8] uppercase tracking-wide">Dépôt simulé ($)</label>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDeposit(e.target.value)}
              className="w-28 bg-[#f0f4fb] border-[1.5px] border-[rgba(8,49,110,0.18)] rounded-[9px] px-3 py-2 text-[#0d1f3c] text-sm font-[Syne] font-bold outline-none"
            />
          </div>
          <button
            onClick={() => void handleDeposit()}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2 text-white border-none rounded-[9px] font-bold text-[13px] cursor-pointer font-['DM_Sans'] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#0aad6a,#08316e)" }}
          >
            <FaArrowDown size={12} /> Simuler dépôt
          </button>

          {/* Retrait conducteur → banque */}
          {isDriver && (
            <button
              onClick={() => void handleWithdraw()}
              disabled={busy}
              className="flex items-center gap-2 px-4 py-2 text-white border-none rounded-[9px] font-bold text-[13px] cursor-pointer font-['DM_Sans'] disabled:opacity-50"
              style={{ background: "linear-gradient(135deg,#08316e,#1a5cb0)" }}
            >
              <FaArrowUp size={12} /> Retrait gains → banque
            </button>
          )}

          {/* Rafraîchir */}
          <button
            onClick={() => void load()}
            disabled={busy}
            className="flex items-center gap-2 px-4 py-2 bg-white text-[#08316e] border-[1.5px] border-[#08316e] rounded-[9px] font-bold text-[13px] cursor-pointer font-['DM_Sans'] disabled:opacity-50"
          >
            <FaRotate size={12} /> Rafraîchir
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mt-2 text-xs font-semibold ${feedback.ok ? "text-[#0aad6a]" : "text-[#e03050]"}`}>
            {feedback.msg}
          </div>
        )}
      </div>

      {/* ── Historique des transactions ──────────────────────────────────────── */}
      <div className="px-5 pb-5">
        <div className="text-[11px] text-[#7a90b8] uppercase tracking-wider font-semibold mb-2">
          Dernières transactions ({account.transactions.length} au total)
        </div>
        <div className="flex flex-col gap-1.5">
          {sortedTxns.length === 0 && (
            <div className="text-xs text-[#7a90b8] italic">Aucune transaction</div>
          )}
          {sortedTxns.map((txn) => (
            <div
              key={txn.id}
              className="flex items-center justify-between bg-[rgba(8,49,110,0.03)] rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: txnColor(txn.type) }}
                />
                <span className="text-[11px] text-[#0d1f3c] font-medium">{txn.description}</span>
                <span className="text-[10px] text-[#7a90b8] hidden md:inline">
                  · {new Date(txn.createdAt).toLocaleDateString("fr-CA")}
                </span>
              </div>
              <span
                className="font-[Syne] font-bold text-sm"
                style={{ color: txnColor(txn.type) }}
              >
                {txnSign(txn.type)}{txn.montant.toFixed(2)} $
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
