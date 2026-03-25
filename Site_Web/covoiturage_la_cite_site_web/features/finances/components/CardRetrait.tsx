"use client";

/**
 * CardRetrait — retrait des gains vers un compte bancaire enregistré (conducteurs seulement).
 * Composant de présentation : reçoit le solde, les comptes bancaires et le callback de retrait via props.
 * Validation locale + confirmation toast + loader + gestion des erreurs backend.
 */

import React, { useState } from "react";
import { FaTriangleExclamation, FaCreditCard, FaCheck, FaSpinner } from "react-icons/fa6";
import Card from "./ui/Card";
import CardHeader from "./ui/CardHeader";
import type { BankAccountModel } from "@/core/models/BankAccountModel";

// ─── Props ──────────────────────────────────────────────────────────────────

interface CardRetraitProps {
  /** Solde disponible pour retrait */
  soldeDisponible: number;
  /** Liste des comptes bancaires de l'utilisateur */
  bankAccounts: BankAccountModel[];
  /** Callback de retrait — exécuté en backend via la page parente */
  onWithdraw: (montant: number, bankAccountId: string) => Promise<{ ok: boolean; msg: string }>;
}

/** Seuil minimum de retrait */
const RETRAIT_MIN = 20.00;

function CardRetrait({ soldeDisponible, bankAccounts, onWithdraw }: CardRetraitProps) {
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState(bankAccounts[0]?.id ?? "");
  const [erreur, setErreur] = useState<string | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Validation locale du montant
  const validerMontant = (val: string): string | null => {
    const montant = parseFloat(val);
    if (isNaN(montant) || montant <= 0) return "Le montant doit être supérieur à 0 $";
    if (montant < RETRAIT_MIN) return `Le montant minimum est de ${RETRAIT_MIN.toFixed(2)} $`;
    if (montant > soldeDisponible) return `Montant supérieur au solde disponible (${soldeDisponible.toFixed(2)} $)`;
    const restant = soldeDisponible - montant;
    if (restant > 0 && restant < RETRAIT_MIN) {
      return `Le solde restant (${restant.toFixed(2)} $) serait insuffisant. Retirez la totalité ou ajustez.`;
    }
    return null;
  };

  // Clic sur "Retirer" → validation puis confirmation
  const handleRetraitClick = () => {
    setSuccessMsg(null);
    const err = validerMontant(amount);
    if (err) {
      setErreur(err);
      return;
    }
    if (!selectedAccountId) {
      setErreur("Veuillez sélectionner un compte bancaire");
      return;
    }
    setErreur(null);
    setConfirmVisible(true);
  };

  // Confirmation du retrait → appel backend
  const handleConfirmer = async () => {
    setBusy(true);
    setErreur(null);
    try {
      const result = await onWithdraw(parseFloat(amount), selectedAccountId);
      if (result.ok) {
        setSuccessMsg(result.msg);
        setAmount("");
        setConfirmVisible(false);
      } else {
        setErreur(result.msg);
        setConfirmVisible(false);
      }
    } catch {
      setErreur("Erreur de communication avec le serveur");
      setConfirmVisible(false);
    } finally {
      setBusy(false);
    }
  };

  // Retrait max
  const handleRetraitMax = () => {
    setAmount(soldeDisponible.toFixed(2));
    setErreur(null);
    setSuccessMsg(null);
  };

  return (
    <Card delay={300}>
      <CardHeader
        dotColor="#c8960a"
        title="Retrait vers compte bancaire"
        right={
          <span className="text-[11px] text-[#7a90b8]">
            Solde disponible : <strong className="text-[#0aad6a]">{soldeDisponible.toFixed(2)} $</strong>
          </span>
        }
      />
      <div
        className="mx-5 my-3.5 p-4 rounded-xl border-[1.5px] border-[#0aad6a]"
        style={{ background: "linear-gradient(135deg,rgba(10,173,106,0.06),rgba(8,49,110,0.06))" }}
      >
        <div className="font-[Syne] font-bold text-sm text-[#0aad6a] mb-2.5 flex items-center gap-2">
          <FaCreditCard size={14} /> Retrait vers votre compte enregistré
        </div>

        {/* Sélecteur de compte bancaire */}
        <div className="bg-[rgba(8,49,110,0.05)] rounded-lg px-3 py-2.5 text-xs text-[#7a90b8] flex justify-between items-center mb-3">
          <span>Compte enregistré :</span>
          <select
            value={selectedAccountId}
            onChange={(e) => setSelectedAccountId(e.target.value)}
            className="bg-transparent border-none text-[#0d1f3c] font-semibold text-xs outline-none cursor-pointer"
          >
            {bankAccounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.nomBanque} {acc.ibanMasque}
              </option>
            ))}
          </select>
        </div>

        {/* Input montant + boutons */}
        <div className="flex gap-2.5 items-center">
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setErreur(null); setSuccessMsg(null); }}
            placeholder="Montant ($)"
            className="flex-1 bg-[#f0f4fb] border-[1.5px] border-[rgba(8,49,110,0.18)] rounded-[9px] px-3.5 py-2.5 text-[#0d1f3c] text-base font-[Syne] font-bold outline-none"
          />
          <button
            onClick={handleRetraitClick}
            disabled={busy}
            className="btn-finance px-5.5 py-2.5 text-white border-none rounded-[9px] font-bold text-[13px] cursor-pointer font-['DM_Sans'] whitespace-nowrap disabled:opacity-50"
            style={{ background: "linear-gradient(135deg,#08316e,#1a5cb0)" }}
          >
            {busy ? <FaSpinner className="animate-spin" size={14} /> : "Retirer"}
          </button>
          <button
            onClick={handleRetraitMax}
            disabled={busy}
            className="btn-finance px-5.5 py-2.5 bg-white text-[#08316e] border-[1.5px] border-[#08316e] rounded-[9px] font-bold text-[13px] cursor-pointer font-['DM_Sans'] whitespace-nowrap disabled:opacity-50"
          >
            Retrait max.
          </button>
        </div>

        {/* Message d'erreur sous l'input */}
        {erreur && (
          <div className="mt-2 text-[11px] text-[#e03050] font-semibold flex items-center gap-1">
            <FaTriangleExclamation size={10} /> {erreur}
          </div>
        )}

        {/* Toast de succès */}
        {successMsg && (
          <div className="mt-2 text-[11px] text-[#0aad6a] font-semibold flex items-center gap-1">
            <FaCheck size={10} /> {successMsg}
          </div>
        )}

        {/* Toast de confirmation */}
        {confirmVisible && !busy && (
          <div className="mt-3 p-3 rounded-lg bg-[rgba(8,49,110,0.06)] border border-[rgba(8,49,110,0.15)] flex items-center justify-between">
            <span className="text-xs text-[#0d1f3c]">
              Confirmer le retrait de <strong>{parseFloat(amount).toFixed(2)} $</strong> ?
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => void handleConfirmer()}
                disabled={busy}
                className="btn-finance px-4 py-1.5 text-white border-none rounded-lg font-bold text-[12px] cursor-pointer disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#0aad6a,#08316e)" }}
              >
                {busy ? <FaSpinner className="animate-spin" size={12} /> : "Confirmer"}
              </button>
              <button
                onClick={() => setConfirmVisible(false)}
                className="btn-finance px-4 py-1.5 bg-white text-[#7a90b8] border border-[rgba(8,49,110,0.15)] rounded-lg font-bold text-[12px] cursor-pointer"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        <div className="mt-2 text-[10px] text-[#7a90b8] flex items-center gap-1">
          <FaTriangleExclamation size={9} className="text-[#c8960a]" />
          Solde min. {RETRAIT_MIN.toFixed(2)} $ · Pénalités déduites automatiquement · Confirmation par email
        </div>
      </div>
    </Card>
  );
}

export default CardRetrait;
