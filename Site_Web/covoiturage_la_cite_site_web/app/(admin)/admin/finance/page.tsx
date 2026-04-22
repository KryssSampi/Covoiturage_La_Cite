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
} from "@/features/admin/services/admin.finance.actions";
import AdminModal from "@/features/admin/components/AdminModal";
import { useAdminToast, AdminToastContainer } from "@/features/admin/components/AdminToast";

export default function AdminFinancePage() {
  const [analytics, setAnalytics] = useState<FinanceData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [penalties, setPenalties] = useState<Penalty[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "transactions" | "penalties">("overview");
  const [selectedPenalty, setSelectedPenalty] = useState<Penalty | null>(null);
  const [waveReason, setWaveReason] = useState("");
  const [reportDates, setReportDates] = useState({ startDate: "", endDate: "" });
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"wave" | "report" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toasts, removeToast, success, error } = useAdminToast();

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
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
    } catch (err) {
      console.error("Erreur chargement finance:", err);
      error("Erreur lors du chargement des données financières");
    } finally {
      setLoading(false);
    }
  };

  const handleWavePenaltyClick = (penalty: Penalty) => {
    setSelectedPenalty(penalty);
    setWaveReason("");
    setModalType("wave");
    setModalOpen(true);
  };

  const handleGenerateReportClick = () => {
    setModalType("report");
    setReportDates({ startDate: "", endDate: "" });
    setModalOpen(true);
  };

  const handleConfirmWave = async () => {
    if (!selectedPenalty || !waveReason.trim()) {
      error("Veuillez entrer une raison");
      return;
    }

    setActionLoading(true);
    try {
      await wavePenaltyAction(selectedPenalty.id, waveReason);
      success("Pénalité annulée!");
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Erreur annulation:", err);
      error("Erreur lors de l'annulation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReport = async () => {
    if (!reportDates.startDate || !reportDates.endDate) {
      error("Veuillez entrer les deux dates");
      return;
    }

    setActionLoading(true);
    try {
      await generateFinanceReportAction(reportDates.startDate, reportDates.endDate);
      success("Rapport généré avec succès!");
      setModalOpen(false);
    } catch (err) {
      console.error("Erreur rapport:", err);
      error("Erreur lors de la génération du rapport");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Gestion Financière</h1>
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          Chargement des données financières...
        </div>
      </div>
    );
  }

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
            <button
              onClick={handleGenerateReportClick}
              className="btn-primary"
            >
              Générer Rapport Financier
            </button>
          </div>
        </>
      )}

      {tab === "transactions" && (
        <>
          {transactions.length > 0 ? (
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
                    <td data-label="ID">{transaction.id.substring(0, 8)}</td>
                    <td data-label="Montant">${transaction.amount.toFixed(2)}</td>
                    <td data-label="Part Plateforme">
                      ${transaction.platformShare.toFixed(2)}
                    </td>
                    <td data-label="Part Conducteur">
                      ${transaction.driverShare.toFixed(2)}
                    </td>
                    <td data-label="Méthode">{transaction.paymentMethod}</td>
                    <td data-label="Statut">
                      <span className={`status-badge ${transaction.status.toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </td>
                    <td data-label="Date">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
              Aucune transaction à afficher.
            </div>
          )}
        </>
      )}

      {tab === "penalties" && (
        <>
          {penalties.length > 0 ? (
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
                    <td data-label="ID">{penalty.id.substring(0, 8)}</td>
                    <td data-label="Utilisateur">
                      {penalty.userId.substring(0, 8)}
                    </td>
                    <td data-label="Raison">{penalty.reason}</td>
                    <td data-label="Montant">${penalty.amount.toFixed(2)}</td>
                    <td data-label="Statut">
                      <span className={`status-badge ${penalty.status.toLowerCase()}`}>
                        {penalty.status}
                      </span>
                    </td>
                    <td data-label="Date">
                      {new Date(penalty.createdAt).toLocaleDateString()}
                    </td>
                    <td data-label="Actions">
                      {penalty.status === "Active" && (
                        <button
                          onClick={() => handleWavePenaltyClick(penalty)}
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
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
              Aucune pénalité à afficher.
            </div>
          )}
        </>
      )}

      <AdminModal
        isOpen={modalOpen && modalType === "wave"}
        title={`Annuler la Pénalité #${selectedPenalty?.id.substring(0, 8)}`}
        message="Entrez une raison pour l'annulation de cette pénalité."
        hasInput
        inputRows={3}
        inputPlaceholder="Ex: Appel de l'utilisateur accepté"
        inputValue={waveReason}
        onInputChange={setWaveReason}
        confirmText="Annuler"
        cancelText="Non, garder"
        isDangerous
        isLoading={actionLoading}
        onConfirm={handleConfirmWave}
        onClose={() => setModalOpen(false)}
      />

      <AdminModal
        isOpen={modalOpen && modalType === "report"}
        title="Générer Rapport Financier"
        message="Choisissez la période pour le rapport."
        confirmText="Générer"
        cancelText="Annuler"
        isLoading={actionLoading}
        onConfirm={handleConfirmReport}
        onClose={() => setModalOpen(false)}
      >
        <div>
          <label>Date de début:</label>
          <input
            type="date"
            value={reportDates.startDate}
            onChange={(e) =>
              setReportDates((prev) => ({ ...prev, startDate: e.target.value }))
            }
            style={{
              width: "100%",
              marginBottom: "12px",
              padding: "10px 12px",
              border: "1px solid #e0e4e8",
              borderRadius: "8px",
            }}
          />
          <label>Date de fin:</label>
          <input
            type="date"
            value={reportDates.endDate}
            onChange={(e) =>
              setReportDates((prev) => ({ ...prev, endDate: e.target.value }))
            }
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e0e4e8",
              borderRadius: "8px",
            }}
          />
        </div>
      </AdminModal>

      <AdminToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
