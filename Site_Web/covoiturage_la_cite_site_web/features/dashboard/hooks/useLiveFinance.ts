"use client";

/**
 * @file useLiveFinance.ts
 * @description Hook SSE pour les données financières du conducteur en temps réel.
 *
 * Fonctionnement :
 * 1. Ouvre une connexion SSE vers /api/sse/db-watch/driver_finance_accounts
 * 2. Reçoit le contenu initial immédiatement + chaque modification du fichier JSON
 *    (écritures internes via PaymentService OU éditions manuelles du fichier)
 * 3. Filtre localement le compte du driverId et calcule le résumé financier
 * 4. Se ferme proprement au démontage ou au changement de driverId
 *
 * Zéro polling, zéro cache — uniquement des push serveur → client via SSE.
 *
 * @param driverId Identifiant du conducteur connecté.
 * @returns { finance, isLoading, error }
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { DriverFinanceSummary } from "@/features/dashboard/types";

/** Structure brute d'un compte reçu via SSE (depuis driver_finance_accounts.json) */
interface RawFinanceAccount {
  id: string;
  driverId: string;
  soldeDisponible: number;
  soldeEnTransit: number;
  soldePenalites: number;
  transactions: {
    type: "revenu_trajet" | "penalite" | "retrait_banque" | "compensation";
    montant: number;
    statut: "confirme" | "en_transit" | "penalite";
    createdAt: string;
  }[];
}

interface UseLiveFinanceResult {
  /** Données financières courantes — null avant le premier message SSE */
  finance: DriverFinanceSummary | null;
  /** Vrai uniquement avant de recevoir le tout premier message du serveur */
  isLoading: boolean;
  /** Message d'erreur si la connexion SSE a échoué */
  error: string | null;
}

/**
 * Transforme un compte brut en résumé financier (DriverFinanceSummary).
 * Le calcul du gain hebdomadaire est fait côté client pour alléger le serveur SSE.
 */
function toFinanceSummary(account: RawFinanceAccount): DriverFinanceSummary {
  // Calcul du début de la semaine (lundi)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
  startOfWeek.setHours(0, 0, 0, 0);

  // Gain hebdomadaire : revenus confirmés depuis lundi
  const weeklyProfit = account.transactions
    .filter(
      (t) =>
        (t.type === "revenu_trajet" || t.type === "compensation") &&
        t.statut === "confirme" &&
        new Date(t.createdAt) >= startOfWeek
    )
    .reduce((sum, t) => sum + t.montant, 0);

  return {
    soldeDisponible:     parseFloat(account.soldeDisponible.toFixed(2)),
    currency:            "CAD",
    weeklyProfit:        parseFloat(weeklyProfit.toFixed(2)),
    weeklyPendingProfit: parseFloat(account.soldeEnTransit.toFixed(2)),
    penalties:           parseFloat(account.soldePenalites.toFixed(2)),
  };
}

export function useLiveFinance(driverId: string | undefined): UseLiveFinanceResult {
  const [finance, setFinance]     = useState<DriverFinanceSummary | null>(null);
  const [isLoading, setIsLoading] = useState(() => !!driverId);
  const [error, setError]         = useState<string | null>(null);

  // Référence stable vers la connexion SSE active
  const esRef = useRef<EventSource | null>(null);

  // Ref pour accéder à finance dans le callback SSE sans l'ajouter aux dépendances
  const financeRef = useRef(finance);
  useEffect(() => { financeRef.current = finance; }, [finance]);

  /**
   * Traite un tableau de comptes bruts reçus depuis le serveur SSE
   * et extrait le résumé financier du conducteur connecté.
   */
  const handleAccounts = useCallback(
    (accounts: RawFinanceAccount[]) => {
      if (!driverId) return;

      const account = accounts.find((a) => a.driverId === driverId);
      if (account) {
        setFinance(toFinanceSummary(account));
      } else {
        // Conducteur pas encore dans le fichier → valeurs à zéro
        setFinance({
          soldeDisponible: 0,
          currency: "CAD",
          weeklyProfit: 0,
          weeklyPendingProfit: 0,
          penalties: 0,
        });
      }
      setIsLoading(false);
      setError(null);
    },
    [driverId]
  );

  useEffect(() => {
    if (!driverId) return;

    // Ouverture de la connexion SSE vers le flux de surveillance du fichier
    const es = new EventSource("/api/sse/db-watch/driver_finance_accounts");
    esRef.current = es;

    // Réception d'un événement 'update' (contenu initial ou modification)
    es.addEventListener("update", (event) => {
      try {
        const accounts: RawFinanceAccount[] = JSON.parse(event.data);
        handleAccounts(accounts);
      } catch {
        console.error("[useLiveFinance] Erreur de parsing SSE");
      }
    });

    // Réception d'un événement 'error' depuis le serveur
    es.addEventListener("error", () => {
      // EventSource se reconnecte automatiquement — on signale l'erreur
      // uniquement si on n'a jamais reçu de données
      if (!financeRef.current) {
        setError("Connexion au flux financier interrompue. Reconnexion en cours…");
        setIsLoading(false);
      }
    });

    // Nettoyage : fermeture propre de la connexion SSE
    return () => {
      es.close();
      esRef.current = null;
    };
  }, [driverId, handleAccounts]);

  return { finance, isLoading, error };
}

