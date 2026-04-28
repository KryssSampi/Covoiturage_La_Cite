"use client";

import { useEffect, useState } from "react";
import {
  getFinanceAnalyticsAction,
  getTransactionsAction,
  getPenaltiesAction,
  wavePenaltyAction,
  generateFinanceReportAction,
  FinanceData,
  Transaction,
  Penalty,
} from "@/features/admin/services/admin.actions";

export default function AdminFinancePage() {
  const [analytics, setAnalytics] = useState<FinanceData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "transactions" | "penalties">("overview");

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      if (tab === "overview" || tab === "transactions") {
        const [analytics, trans] = await Promise.all([
          getFinanceAnalyticsAction(),
          getTransactionsAction(),
        ]);
        setAnalytics(analytics);
        setTransactions(trans);
      }
      if (tab === "penalties") {
        const pen = await getPenaltiesAction();
        setPenalties(pen);
      }
    } catch (error) {
      console.error("Erreur chargement finance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleWavePenalty = async (penaltyId: string) => {
    const reason = prompt("Raison de l'annulation:");
    if (reason) {
      try {
        await wavePenaltyAction(penaltyId, reason);
        await loadData();
        alert("Pénalité annulée!");
      } catch (error) {
        console.error("Erreur annulation:", error);
      }
    }
  };

  const handleGenerateReport = async () => {
    const startDate = prompt("Date début (YYYY-MM-DD):");
    if (!startDate) return;
    const endDate = prompt("Date fin (YYYY-MM-DD):");
    if (!endDate) return;

    try {
      await generateFinanceReportAction(startDate, endDate);
      alert("Rapport généré avec succès!");
    } catch (error) {
      console.error("Erreur rapport:", error);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <>
      <h1>Gestion Financière</h1>

      <div className="tab-controls">
        <button
          className={tab === "overview" ? "active" : ""}
          onClick={() => setTab("overview")}
        >
          Vue d'ensemble
        </button>
        <button
          className={tab === "transactions" ? "active" : ""}
          onClick={() => setTab("transactions")}
        >
          Transactions
        </button>
        <button
          className={tab === "penalties" ? "active" : ""}
          onClick={() => setTab("penalties")}
        >
          Pénalités
        </button>
      </div>

      {tab === "overview" && analytics && (
        <>
          <section className="finance-overview">
            <div className="finance-card">
              <h3>Revenu Total</h3>
              <p className="value">${analytics.totalRevenue.toFixed(2)}</p>
            </div>
            <div className="finance-card">
              <h3>Nombre Transactions</h3>
              <p className="value">{analytics.totalTransactions}</p>
            </div>
            <div className="finance-card">
              <h3>Part Plateforme (15%)</h3>
              <p className="value">${analytics.platformShare.toFixed(2)}</p>
            </div>
            <div className="finance-card">
              <h3>Part Conducteurs (85%)</h3>
              <p className="value">${analytics.driverShare.toFixed(2)}</p>
            </div>
            <div className="finance-card">
              <h3>Montant Moyen/Transaction</h3>
              <p className="value">${analytics.averageTransactionValue.toFixed(2)}</p>
            </div>
            <div className="finance-card alert">
              <h3>Paiements en Attente</h3>
              <p className="value">${analytics.pendingPayouts.toFixed(2)}</p>
            </div>
          </section>

          <div className="action-controls">
            <button onClick={handleGenerateReport} className="btn-primary">
              Générer Rapport Financier
            </button>
          </div>
        </>
      )}

      {tab === "transactions" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Montant</th>
              <th>Part Plateforme</th>
              <th>Part Conducteur</th>
              <th>Méthode</th>
              <th>Statut</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.id.substring(0, 8)}</td>
                <td>${transaction.amount.toFixed(2)}</td>
                <td>${transaction.platformShare.toFixed(2)}</td>
                <td>${transaction.driverShare.toFixed(2)}</td>
                <td>{transaction.paymentMethod}</td>
                <td>
                  <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                    {transaction.status}
                  </span>
                </td>
                <td>{new Date(transaction.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "penalties" && (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Utilisateur</th>
              <th>Raison</th>
              <th>Montant</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {penalties.map((penalty) => (
              <tr key={penalty.id}>
                <td>{penalty.id.substring(0, 8)}</td>
                <td>{penalty.userId.substring(0, 8)}</td>
                <td>{penalty.reason}</td>
                <td>${penalty.amount.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${penalty.status.toLowerCase()}`}>
                    {penalty.status}
                  </span>
                </td>
                <td>{new Date(penalty.createdAt).toLocaleDateString()}</td>
                <td>
                  {penalty.status === "Active" && (
                    <button
                      onClick={() => handleWavePenalty(penalty.id)}
                      className="btn-warning"
                    >
                      Annuler
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(tab === "transactions" && transactions.length === 0) ||
        (tab === "penalties" && penalties.length === 0) ? (
        <p>Aucune donnée à afficher.</p>
      ) : null}
    </>
  );
}
