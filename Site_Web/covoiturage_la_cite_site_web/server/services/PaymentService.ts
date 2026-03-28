/**
 * PaymentService — Service de paiement simulé.
 *
 * Logique métier complète du système de paiement :
 * - Pré-autorisation lors de l'acceptation d'une réservation
 * - Capture du paiement après fin du trajet (85% conducteur / 15% plateforme)
 * - Gestion des pénalités (retard, annulation, no-show)
 * - Remboursements passager selon délai d'annulation
 * - Retraits vers compte bancaire simulé
 *
 * Ce service sera migré vers un serveur distant lors de la mise en production.
 * Usage server-side uniquement (API routes Next.js).
 */

import { persistenceManager } from "@/tests/PersistenceManager";
import type { BankAccountModel, BankAccountTransaction } from "@/core/models/BankAccountModel";
import type { DriverFinanceAccountModel, DriverFinanceTransaction } from "@/core/models/DriverFinanceAccountModel";

// ─── Constantes métier (du manifeste fonctionnel) ────────────────────────────

/** Commission plateforme : 15% */
const COMMISSION = 0.15;

/** Frais d'affichage au passager : prix conducteur + 15% */
const MARKUP_PASSAGER = 1.15;

/** Montant bloqué dès l'envoi d'une demande de réservation */
const HOLDING_PASSAGER = 1.50;

/** Seuil minimum pour un retrait conducteur */
const RETRAIT_MIN = 20.00;

// ─── Types internes ───────────────────────────────────────────────────────────

type PenaliteRecord = {
  id: string;
  userId: string;
  trajetId?: string;
  reservationId?: string;
  type: string;
  montant: number;
  raison: string;
  statut: "active" | "prelevee" | "contestee" | "remboursee";
  createdAt: string;
  updatedAt: string;
};

type ReservationRecord = Record<string, unknown>;
type TripRecord = Record<string, unknown>;

// ─── Utilitaires ─────────────────────────────────────────────────────────────

function genId(prefix: string): string {
  const year = new Date().getFullYear();
  const rand = String(Math.floor(10000 + Math.random() * 90000));
  return `${prefix}-${year}-${rand}`;
}

function now(): string {
  return new Date().toISOString();
}

// ─── SERVICE ─────────────────────────────────────────────────────────────────

export class PaymentService {
  /**
   * Étape 1 — Blocage de 1.5$ sur le compte bancaire du passager
   * lors de l'envoi d'une demande de réservation.
   * L'argent passe en "montantEnTransit", pas encore débité.
   */
  blockHoldingAmount(passengerId: string, reservationId: string): void {
    const accounts = persistenceManager.readAll<BankAccountModel>("bank_accounts");
    const idx = accounts.findIndex((a) => a.userId === passengerId);
    if (idx === -1) return;

    const account = accounts[idx];
    // Vérifie le solde (holding + retrait ne doivent pas dépasser le solde)
    if (account.soldeDisponible < HOLDING_PASSAGER) return;

    const txn: BankAccountTransaction = {
      id: genId("BTXN"),
      type: "transit_sortant",
      montant: HOLDING_PASSAGER,
      description: `Réservation ${reservationId} — mise en attente 1.5$`,
      statut: "en_transit",
      createdAt: now(),
    };

    accounts[idx] = {
      ...account,
      soldeDisponible: account.soldeDisponible - HOLDING_PASSAGER,
      montantEnTransit: account.montantEnTransit + HOLDING_PASSAGER,
      transactions: [...account.transactions, txn],
      updatedAt: now(),
    };

    persistenceManager.writeAll("bank_accounts", accounts);
  }

  /**
   * Annule le blocage de 1.5$ si toutes les demandes sont refusées ou expirées.
   * Retour des 1.5$ vers le solde disponible.
   */
  releaseHoldingAmount(passengerId: string, reservationId: string): void {
    const accounts = persistenceManager.readAll<BankAccountModel>("bank_accounts");
    const idx = accounts.findIndex((a) => a.userId === passengerId);
    if (idx === -1) return;

    const account = accounts[idx];
    if (account.montantEnTransit < HOLDING_PASSAGER) return;

    const txn: BankAccountTransaction = {
      id: genId("BTXN"),
      type: "transit_entrant",
      montant: HOLDING_PASSAGER,
      description: `Remboursement mise en attente — réservation ${reservationId} refusée`,
      statut: "complete",
      createdAt: now(),
    };

    accounts[idx] = {
      ...account,
      soldeDisponible: account.soldeDisponible + HOLDING_PASSAGER,
      montantEnTransit: Math.max(0, account.montantEnTransit - HOLDING_PASSAGER),
      transactions: [...account.transactions, txn],
      updatedAt: now(),
    };

    persistenceManager.writeAll("bank_accounts", accounts);
  }

  /**
   * Étape 2 — Pré-autorisation au moment de l'acceptation.
   * Le passager voit le prix conducteur + 15% (markup).
   * Le montant total (prix × 1.15) est débité du compte bancaire passager.
   * Les 6$ déjà en transit sont comptabilisés (déduits du total restant).
   * Le montant passe en "en_transit" côté conducteur (soldeEnTransit).
   */
  preAuthorizePayment(
    passengerId: string,
    driverId: string,
    pricePerPassenger: number,
    tripId: string,
    reservationId: string
  ): { prixAffiche: number; montantDebite: number } {
    const prixAffiche = parseFloat((pricePerPassenger * MARKUP_PASSAGER).toFixed(2));
    // Les 1.50$ déjà en transit sont déduits
    const montantRestant = parseFloat((prixAffiche - HOLDING_PASSAGER).toFixed(2));
    const montantDebite = montantRestant > 0 ? montantRestant : 0;

    // Débit du reste sur le compte passager
    if (montantDebite > 0) {
      const accounts = persistenceManager.readAll<BankAccountModel>("bank_accounts");
      const idx = accounts.findIndex((a) => a.userId === passengerId);
      if (idx !== -1) {
        const account = accounts[idx];
        const txn: BankAccountTransaction = {
          id: genId("BTXN"),
          type: "transit_sortant",
          montant: montantDebite,
          description: `Trajet ${tripId} — solde pré-autorisé (1.50$ déjà retenus)`,
          statut: "en_transit",
          createdAt: now(),
        };
        accounts[idx] = {
          ...account,
          soldeDisponible: account.soldeDisponible - montantDebite,
          montantEnTransit: account.montantEnTransit + montantDebite + HOLDING_PASSAGER,
          transactions: [...account.transactions, txn],
          updatedAt: now(),
        };
        persistenceManager.writeAll("bank_accounts", accounts);
      }
    }

    // Mise en transit côté conducteur
    const dfAccounts = persistenceManager.readAll<DriverFinanceAccountModel>("driver_finance_accounts");
    const dfIdx = dfAccounts.findIndex((a) => a.driverId === driverId);
    const conducteurBrut = parseFloat((pricePerPassenger * (1 - COMMISSION)).toFixed(2));

    if (dfIdx !== -1) {
      const df = dfAccounts[dfIdx];
      const txn: DriverFinanceTransaction = {
        id: genId("DTXN"),
        type: "revenu_trajet",
        montant: conducteurBrut,
        description: `Trajet ${tripId} — en transit (réservation ${reservationId})`,
        trajetId: tripId,
        statut: "en_transit",
        createdAt: now(),
      };
      dfAccounts[dfIdx] = {
        ...df,
        soldeEnTransit: df.soldeEnTransit + conducteurBrut,
        transactions: [...df.transactions, txn],
        updatedAt: now(),
      };
      persistenceManager.writeAll("driver_finance_accounts", dfAccounts);
    }

    return { prixAffiche, montantDebite };
  }

  /**
   * Étape 3 — Capture du paiement après fin du trajet.
   * 85% → compte conducteur (disponible immédiatement)
   * 15% → compte plateforme
   * Si balance_penalite > 0 : prélèvement automatique sur les revenus.
   */
  capturePayment(
    passengerId: string,
    driverId: string,
    pricePerPassenger: number,
    tripId: string,
    reservationId: string
  ): void {
    const prixAffiche = parseFloat((pricePerPassenger * MARKUP_PASSAGER).toFixed(2));
    const conducteurBrut = parseFloat((pricePerPassenger * (1 - COMMISSION)).toFixed(2));
    const commissionPlateforme = parseFloat((pricePerPassenger * COMMISSION).toFixed(2));

    // ── Libération transit passager ───────────────────────────────────────────
    const bankAccounts = persistenceManager.readAll<BankAccountModel>("bank_accounts");
    const passengerIdx = bankAccounts.findIndex((a) => a.userId === passengerId);
    if (passengerIdx !== -1) {
      const acc = bankAccounts[passengerIdx];
      const txn: BankAccountTransaction = {
        id: genId("BTXN"),
        type: "transit_sortant",
        montant: prixAffiche,
        description: `Paiement capturé — trajet ${tripId}`,
        statut: "complete",
        createdAt: now(),
      };
      bankAccounts[passengerIdx] = {
        ...acc,
        montantEnTransit: Math.max(0, acc.montantEnTransit - prixAffiche),
        transactions: [...acc.transactions, txn],
        updatedAt: now(),
      };
    }

    // ── Capture commission plateforme ─────────────────────────────────────────
    const platformIdx = bankAccounts.findIndex((a) => a.userId === "ADMIN-SYSTEM");
    if (platformIdx !== -1) {
      const acc = bankAccounts[platformIdx];
      const txn: BankAccountTransaction = {
        id: genId("BTXN"),
        type: "transit_entrant",
        montant: commissionPlateforme,
        description: `Commission trajet ${tripId}`,
        statut: "complete",
        createdAt: now(),
      };
      bankAccounts[platformIdx] = {
        ...acc,
        soldeDisponible: acc.soldeDisponible + commissionPlateforme,
        transactions: [...acc.transactions, txn],
        updatedAt: now(),
      };
    }
    persistenceManager.writeAll("bank_accounts", bankAccounts);

    // ── Capture revenus conducteur ────────────────────────────────────────────
    const dfAccounts = persistenceManager.readAll<DriverFinanceAccountModel>("driver_finance_accounts");
    const dfIdx = dfAccounts.findIndex((a) => a.driverId === driverId);
    if (dfIdx !== -1) {
      const df = dfAccounts[dfIdx];
      // Prélèvement pénalités si applicable
      let revenus = conducteurBrut;
      let penalitesPrelevees = 0;
      if (df.soldePenalites > 0) {
        penalitesPrelevees = Math.min(df.soldePenalites, revenus * df.tauxPrelevement);
        revenus = parseFloat((revenus - penalitesPrelevees).toFixed(2));
      }

      const txn: DriverFinanceTransaction = {
        id: genId("DTXN"),
        type: "revenu_trajet",
        montant: revenus,
        description: `Trajet ${tripId} — paiement capturé${penalitesPrelevees > 0 ? ` (pénalité ${penalitesPrelevees}$ prélevée)` : ""}`,
        trajetId: tripId,
        statut: "confirme",
        createdAt: now(),
      };

      dfAccounts[dfIdx] = {
        ...df,
        soldeDisponible: df.soldeDisponible + revenus,
        soldeEnTransit: Math.max(0, df.soldeEnTransit - conducteurBrut),
        soldePenalites: Math.max(0, df.soldePenalites - penalitesPrelevees),
        transactions: [...df.transactions, txn],
        updatedAt: now(),
      };
      persistenceManager.writeAll("driver_finance_accounts", dfAccounts);
    }
  }

  /**
   * Remboursement passager selon délai d'annulation :
   * - > 24h avant départ : 100%
   * - 1h–24h avant départ : 50%  (35% → conducteur, 15% → plateforme)
   * - < 1h avant départ : 0% + pénalité 10 pts réputation
   */
  refundPassenger(
    passengerId: string,
    driverId: string,
    pricePerPassenger: number,
    tripId: string,
    reservationId: string,
    minutesAvantDepart: number
  ): { tauxRemboursement: number; montantRembourse: number } {
    const prixAffiche = parseFloat((pricePerPassenger * MARKUP_PASSAGER).toFixed(2));
    let tauxRemboursement = 0;

    if (minutesAvantDepart > 1440) {
      tauxRemboursement = 1.0; // > 24h : 100%
    } else if (minutesAvantDepart > 60) {
      tauxRemboursement = 0.5; // 1h–24h : 50%
    } else {
      tauxRemboursement = 0; // < 1h : 0%
    }

    const montantRembourse = parseFloat((prixAffiche * tauxRemboursement).toFixed(2));

    if (montantRembourse > 0) {
      const bankAccounts = persistenceManager.readAll<BankAccountModel>("bank_accounts");
      const passengerIdx = bankAccounts.findIndex((a) => a.userId === passengerId);
      if (passengerIdx !== -1) {
        const acc = bankAccounts[passengerIdx];
        const txn: BankAccountTransaction = {
          id: genId("BTXN"),
          type: "transit_entrant",
          montant: montantRembourse,
          description: `Remboursement annulation trajet ${tripId} (${Math.round(tauxRemboursement * 100)}%)`,
          statut: "complete",
          createdAt: now(),
        };
        bankAccounts[passengerIdx] = {
          ...acc,
          soldeDisponible: acc.soldeDisponible + montantRembourse,
          montantEnTransit: Math.max(0, acc.montantEnTransit - prixAffiche),
          transactions: [...acc.transactions, txn],
          updatedAt: now(),
        };
        persistenceManager.writeAll("bank_accounts", bankAccounts);
      }

      // 50% → conducteur partiel si annulation 1h–24h
      if (tauxRemboursement === 0.5) {
        const conducteurCompensation = parseFloat((prixAffiche * 0.35).toFixed(2));
        this._creditDriverFinance(driverId, conducteurCompensation, tripId, `Compensation annulation passager (50%) — trajet ${tripId}`);
        const plateformePart = parseFloat((prixAffiche * 0.15).toFixed(2));
        this._creditPlatformAccount(plateformePart, `Frais annulation tardive — trajet ${tripId}`);
      }
    }

    return { tauxRemboursement, montantRembourse };
  }

  /**
   * Applique une pénalité au conducteur selon le type d'incident.
   * Pénalités définies dans le manifeste fonctionnel section 7.3.
   */
  applyDriverPenalty(
    driverId: string,
    type: "retard_15_30" | "retard_30_60" | "retard_60plus" | "annulation_tardive" | "no_show" | "signalement_valide",
    tripId: string,
    reservationIds: string[]
  ): { montant: number; pointsReputation: number; suspension?: string } {
    const PENALITES = {
      retard_15_30:       { montant: 5,   points: 5,  suspension: undefined                         },
      retard_30_60:       { montant: 10,  points: 10, suspension: undefined                         },
      retard_60plus:      { montant: 0,   points: 25, suspension: undefined, autoCancel: true       },
      annulation_tardive: { montant: 15,  points: 15, suspension: undefined                         },
      no_show:            { montant: 50,  points: 50, suspension: "7_jours"                         },
      signalement_valide: { montant: 100, points: 50, suspension: "30_jours"                        },
    };

    const pen = PENALITES[type];
    const now_ = now();

    // Enregistrement de la pénalité dans le JSON
    const penaliteRecord: PenaliteRecord = {
      id: genId("PEN"),
      userId: driverId,
      trajetId: tripId,
      reservationId: reservationIds[0],
      type,
      montant: pen.montant,
      raison: `Pénalité automatique : ${type.replace(/_/g, " ")}`,
      statut: "active",
      createdAt: now_,
      updatedAt: now_,
    };
    persistenceManager.addItem("penalites", penaliteRecord);

    // Prélèvement immédiat ou ajout à balance_penalite
    if (pen.montant > 0) {
      const dfAccounts = persistenceManager.readAll<DriverFinanceAccountModel>("driver_finance_accounts");
      const dfIdx = dfAccounts.findIndex((a) => a.driverId === driverId);
      if (dfIdx !== -1) {
        const df = dfAccounts[dfIdx];
        let montantPrelevé = 0;

        if (df.soldeDisponible >= pen.montant) {
          // Prélèvement immédiat
          montantPrelevé = pen.montant;
          const txn: DriverFinanceTransaction = {
            id: genId("DTXN"),
            type: "penalite",
            montant: pen.montant,
            description: `Pénalité ${type.replace(/_/g, " ")} — trajet ${tripId}`,
            trajetId: tripId,
            statut: "penalite",
            createdAt: now_,
          };
          dfAccounts[dfIdx] = {
            ...df,
            soldeDisponible: df.soldeDisponible - pen.montant,
            tauxPrelevement: df.soldePenalites > 0 ? 0.20 : 0.10,
            transactions: [...df.transactions, txn],
            updatedAt: now_,
          };
        } else {
          // Prélèvement partiel + balance_penalite pour le reste
          montantPrelevé = df.soldeDisponible;
          const reste = pen.montant - montantPrelevé;
          const txn: DriverFinanceTransaction = {
            id: genId("DTXN"),
            type: "penalite",
            montant: pen.montant,
            description: `Pénalité ${type.replace(/_/g, " ")} — ${reste}$ mis en balance pénalité`,
            trajetId: tripId,
            statut: "penalite",
            createdAt: now_,
          };
          dfAccounts[dfIdx] = {
            ...df,
            soldeDisponible: 0,
            soldePenalites: df.soldePenalites + reste,
            tauxPrelevement: 0.20, // Taux augmenté pour les prochains revenus
            transactions: [...df.transactions, txn],
            updatedAt: now_,
          };
        }
        persistenceManager.writeAll("driver_finance_accounts", dfAccounts);
      }
    }

    return { montant: pen.montant, pointsReputation: pen.points, suspension: pen.suspension };
  }

  /**
   * Applique une pénalité au passager (no-show).
   */
  applyPassengerPenalty(
    passengerId: string,
    driverId: string,
    pricePerPassenger: number,
    tripId: string,
    reservationId: string,
    type: "no_show" | "annulation_tardive" | "signalement_valide"
  ): void {
    const prixAffiche = parseFloat((pricePerPassenger * MARKUP_PASSAGER).toFixed(2));

    const penaliteRecord: PenaliteRecord = {
      id: genId("PEN"),
      userId: passengerId,
      trajetId: tripId,
      reservationId,
      type,
      montant: prixAffiche,
      raison: `Pénalité passager : ${type.replace(/_/g, " ")}`,
      statut: "prelevee",
      createdAt: now(),
      updatedAt: now(),
    };
    persistenceManager.addItem("penalites", penaliteRecord);

    // 85% vers conducteur, 15% vers plateforme
    const conducteurPart = parseFloat((prixAffiche * 0.85).toFixed(2));
    this._creditDriverFinance(driverId, conducteurPart, tripId, `Pénalité no-show passager — trajet ${tripId}`);
    const plateformePart = parseFloat((prixAffiche * 0.15).toFixed(2));
    this._creditPlatformAccount(plateformePart, `Frais pénalité passager — trajet ${tripId}`);

    // Libère le transit passager (montant déjà retenu)
    const bankAccounts = persistenceManager.readAll<BankAccountModel>("bank_accounts");
    const passengerIdx = bankAccounts.findIndex((a) => a.userId === passengerId);
    if (passengerIdx !== -1) {
      const acc = bankAccounts[passengerIdx];
      bankAccounts[passengerIdx] = {
        ...acc,
        montantEnTransit: Math.max(0, acc.montantEnTransit - prixAffiche),
        updatedAt: now(),
      };
      persistenceManager.writeAll("bank_accounts", bankAccounts);
    }
  }

  /**
   * Retrait conducteur : DriverFinanceAccount → BankAccount simulé.
   */
  withdrawDriverToBank(driverId: string): { success: boolean; message: string; montant: number } {
    const dfAccounts = persistenceManager.readAll<DriverFinanceAccountModel>("driver_finance_accounts");
    const dfIdx = dfAccounts.findIndex((a) => a.driverId === driverId);

    if (dfIdx === -1) return { success: false, message: "Compte conducteur introuvable", montant: 0 };

    const df = dfAccounts[dfIdx];
    if (df.soldeDisponible < RETRAIT_MIN) {
      return { success: false, message: `Solde insuffisant (minimum ${RETRAIT_MIN}$)`, montant: 0 };
    }
    if (df.soldePenalites > 0) {
      return { success: false, message: "Litige de pénalité en cours — retrait bloqué", montant: 0 };
    }

    const montant = df.soldeDisponible;

    // Débit DriverFinanceAccount
    const txnDF: DriverFinanceTransaction = {
      id: genId("DTXN"),
      type: "retrait_banque",
      montant,
      description: "Retrait vers compte bancaire",
      statut: "confirme",
      createdAt: now(),
    };
    dfAccounts[dfIdx] = {
      ...df,
      soldeDisponible: 0,
      transactions: [...df.transactions, txnDF],
      updatedAt: now(),
    };
    persistenceManager.writeAll("driver_finance_accounts", dfAccounts);

    // Crédit BankAccount
    const bankAccounts = persistenceManager.readAll<BankAccountModel>("bank_accounts");
    const bankIdx = bankAccounts.findIndex((a) => a.userId === driverId);
    if (bankIdx !== -1) {
      const acc = bankAccounts[bankIdx];
      const txnBank: BankAccountTransaction = {
        id: genId("BTXN"),
        type: "depot",
        montant,
        description: `Retrait depuis Cité-Voiturage — ${montant.toFixed(2)}$`,
        statut: "complete",
        createdAt: now(),
      };
      bankAccounts[bankIdx] = {
        ...acc,
        soldeDisponible: acc.soldeDisponible + montant,
        transactions: [...acc.transactions, txnBank],
        updatedAt: now(),
      };
      persistenceManager.writeAll("bank_accounts", bankAccounts);
    }

    return { success: true, message: `Retrait de ${montant.toFixed(2)}$ effectué`, montant };
  }

  /**
   * Dépôt dans le compte bancaire simulé (pour les tests).
   */
  depositToBank(userId: string, montant: number, description: string): void {
    if (montant <= 0) return;
    const bankAccounts = persistenceManager.readAll<BankAccountModel>("bank_accounts");
    const idx = bankAccounts.findIndex((a) => a.userId === userId);
    if (idx === -1) return;

    const acc = bankAccounts[idx];
    const txn: BankAccountTransaction = {
      id: genId("BTXN"),
      type: "depot",
      montant,
      description,
      statut: "complete",
      createdAt: now(),
    };
    bankAccounts[idx] = {
      ...acc,
      soldeDisponible: acc.soldeDisponible + montant,
      transactions: [...acc.transactions, txn],
      updatedAt: now(),
    };
    persistenceManager.writeAll("bank_accounts", bankAccounts);
  }

  // ─── Méthodes privées ───────────────────────────────────────────────────────

  /** Crédite les revenus conducteur */
  private _creditDriverFinance(driverId: string, montant: number, tripId: string, description: string): void {
    const dfAccounts = persistenceManager.readAll<DriverFinanceAccountModel>("driver_finance_accounts");
    const dfIdx = dfAccounts.findIndex((a) => a.driverId === driverId);
    if (dfIdx === -1) return;

    const df = dfAccounts[dfIdx];
    const txn: DriverFinanceTransaction = {
      id: genId("DTXN"),
      type: "compensation",
      montant,
      description,
      trajetId: tripId,
      statut: "confirme",
      createdAt: now(),
    };
    dfAccounts[dfIdx] = {
      ...df,
      soldeDisponible: df.soldeDisponible + montant,
      transactions: [...df.transactions, txn],
      updatedAt: now(),
    };
    persistenceManager.writeAll("driver_finance_accounts", dfAccounts);
  }

  /** Crédite le compte de la plateforme */
  private _creditPlatformAccount(montant: number, description: string): void {
    const bankAccounts = persistenceManager.readAll<BankAccountModel>("bank_accounts");
    const platformIdx = bankAccounts.findIndex((a) => a.userId === "ADMIN-SYSTEM");
    if (platformIdx === -1) return;

    const acc = bankAccounts[platformIdx];
    const txn: BankAccountTransaction = {
      id: genId("BTXN"),
      type: "transit_entrant",
      montant,
      description,
      statut: "complete",
      createdAt: now(),
    };
    bankAccounts[platformIdx] = {
      ...acc,
      soldeDisponible: acc.soldeDisponible + montant,
      transactions: [...acc.transactions, txn],
      updatedAt: now(),
    };
    persistenceManager.writeAll("bank_accounts", bankAccounts);
  }
}

/** Instance singleton exportée — usage server-side uniquement */
export const paymentService = new PaymentService();
