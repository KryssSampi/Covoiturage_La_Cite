"use client";

import { useEffect, useState } from "react";
import {
  getReportsAction,
  updateReportStatusAction,
  dismissReportAction,
  Report,
} from "@/features/admin/services/admin.reports.actions";
import AdminModal from "@/features/admin/components/AdminModal";
import { useAdminToast, AdminToastContainer } from "@/features/admin/components/AdminToast";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<"Open" | "InReview" | "Resolved" | "All">("Open");
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [dismissalReason, setDismissalReason] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"dismiss" | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const { toasts, removeToast, success, error } = useAdminToast();

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await getReportsAction();
      const filtered = filter === "All" ? data : data.filter((r) => r.status === filter);
      setReports(filtered);
    } catch (err) {
      console.error("Erreur chargement rapports:", err);
      error("Erreur lors du chargement des rapports");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      await updateReportStatusAction(reportId, newStatus);
      success("Statut du rapport mis à jour");
      await loadReports();
    } catch (err) {
      console.error("Erreur mise à jour:", err);
      error("Erreur lors de la mise à jour du rapport");
    }
  };

  const handleDismissClick = (report: Report) => {
    setSelectedReport(report);
    setDismissalReason("");
    setModalType("dismiss");
    setModalOpen(true);
  };

  const handleConfirmDismiss = async () => {
    if (!selectedReport || !dismissalReason.trim()) {
      error("Veuillez entrer une raison");
      return;
    }

    setActionLoading(true);
    try {
      await dismissReportAction(selectedReport.id, dismissalReason);
      success("Rapport rejeté avec succès");
      setModalOpen(false);
      await loadReports();
    } catch (err) {
      console.error("Erreur rejet:", err);
      error("Erreur lors du rejet du rapport");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Gestion des Signalements</h1>
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          Chargement des rapports...
        </div>
      </div>
    );
  }

  return (
    <>
      <h1>Gestion des Signalements</h1>

      <div className="filter-controls">
        <label>Filtrer par statut:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)}>
          <option value="Open">Ouverts</option>
          <option value="InReview">En révision</option>
          <option value="Resolved">Résolus</option>
          <option value="All">Tous</option>
        </select>
      </div>

      {reports.length > 0 ? (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Catégorie</th>
              <th>Signalé par</th>
              <th>Cible</th>
              <th>Sévérité</th>
              <th>Statut</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id}>
                <td data-label="ID">{report.id.substring(0, 8)}</td>
                <td data-label="Catégorie">{report.category}</td>
                <td data-label="Signalé par">{report.userId.substring(0, 8)}</td>
                <td data-label="Cible">{report.reportedUserId.substring(0, 8)}</td>
                <td data-label="Sévérité">
                  <span className={`severity-badge ${report.severity.toLowerCase()}`}>
                    {report.severity}
                  </span>
                </td>
                <td data-label="Statut">
                  <select
                    value={report.status}
                    onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                    style={{
                      padding: "6px 8px",
                      borderRadius: "4px",
                      border: "1px solid #e0e4e8",
                      fontSize: "13px",
                      cursor: "pointer",
                    }}
                  >
                    <option value="Open">Ouvert</option>
                    <option value="InReview">En révision</option>
                    <option value="Resolved">Résolu</option>
                  </select>
                </td>
                <td data-label="Date">{new Date(report.createdAt).toLocaleDateString()}</td>
                <td data-label="Actions">
                  <button
                    onClick={() => handleDismissClick(report)}
                    className="btn-danger"
                  >
                    Rejeter
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          Aucun signalement à afficher.
        </div>
      )}

      <AdminModal
        isOpen={modalOpen && modalType === "dismiss"}
        title={`Rejeter le signalement #${selectedReport?.id.substring(0, 8)}`}
        message="Entrez une raison pour le rejet de ce signalement."
        hasInput
        inputRows={3}
        inputPlaceholder="Ex: Faux rapport, contenu peu clair"
        inputValue={dismissalReason}
        onInputChange={setDismissalReason}
        confirmText="Rejeter"
        cancelText="Annuler"
        isDangerous
        isLoading={actionLoading}
        onConfirm={handleConfirmDismiss}
        onClose={() => setModalOpen(false)}
      />

      <AdminToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
