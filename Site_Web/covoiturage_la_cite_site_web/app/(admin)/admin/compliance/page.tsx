"use client";

import { useEffect, useState } from "react";
import {
  getComplianceStatusAction,
  getExportRequestsAction,
  processExportAction,
  anonymizeUserAction,
  generateComplianceReportAction,
  ComplianceStatus,
  UserExport,
} from "@/features/admin/services/admin.compliance.actions";
import AdminModal from "@/features/admin/components/AdminModal";
import { useAdminToast, AdminToastContainer } from "@/features/admin/components/AdminToast";

export default function AdminCompliancePage() {
  const [status, setStatus] = useState<ComplianceStatus | null>(null);
  const [exports, setExports] = useState<UserExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "exports">("overview");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<"anonymize" | "reportDates" | null>(null);
  const [anonymizeInput, setAnonymizeInput] = useState({ userId: "", reason: "" });
  const [reportDates, setReportDates] = useState({ startDate: "", endDate: "" });
  const [actionLoading, setActionLoading] = useState(false);
  const { toasts, removeToast, success, error } = useAdminToast();

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      setLoading(true);
      const statusData = await getComplianceStatusAction();
      setStatus(statusData);
      if (tab === "exports") {
        const exportsData = await getExportRequestsAction();
        setExports(exportsData);
      }
    } catch (err) {
      console.error("Erreur chargement compliance:", err);
      error("Erreur lors du chargement des données de conformité");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessExport = async (exportId: string) => {
    setActionLoading(true);
    try {
      await processExportAction(exportId);
      success("Export traité avec succès!");
      await loadData();
    } catch (err) {
      console.error("Erreur traitement:", err);
      error("Erreur lors du traitement de l'export");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAnonymizeClick = () => {
    setModalType("anonymize");
    setAnonymizeInput({ userId: "", reason: "" });
    setModalOpen(true);
  };

  const handleGenerateReportClick = () => {
    setModalType("reportDates");
    setReportDates({ startDate: "", endDate: "" });
    setModalOpen(true);
  };

  const handleConfirmAnonymize = async () => {
    if (!anonymizeInput.userId.trim() || !anonymizeInput.reason.trim()) {
      error("Veuillez entrer l'ID de l'utilisateur et une raison");
      return;
    }

    setActionLoading(true);
    try {
      await anonymizeUserAction(anonymizeInput.userId, anonymizeInput.reason);
      success("Utilisateur anonymisé avec succès!");
      setModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Erreur anonymisation:", err);
      error("Erreur lors de l'anonymisation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReportDates = async () => {
    if (!reportDates.startDate || !reportDates.endDate) {
      error("Veuillez entrer les deux dates");
      return;
    }

    setActionLoading(true);
    try {
      await generateComplianceReportAction();
      success("Rapport PIPEDA généré avec succès!");
      setModalOpen(false);
      await loadData();
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
        <h1>Conformité PIPEDA</h1>
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          Chargement des données de conformité...
        </div>
      </div>
    );
  }

  return (
    <>
      <h1>Conformité PIPEDA</h1>

      <div className="tab-controls">
        <button
          className={tab === "overview" ? "active" : ""}
          onClick={() => setTab("overview")}
        >
          Vue d'ensemble
        </button>
        <button
          className={tab === "exports" ? "active" : ""}
          onClick={() => setTab("exports")}
        >
          Demandes d'Export
        </button>
      </div>

      {tab === "overview" && status && (
        <>
          <section className="compliance-overview">
            <div className="compliance-card">
              <h3>Consentements Collectés</h3>
              <p className="value">{status.consentCollected}</p>
            </div>
            <div className="compliance-card alert">
              <h3>Consentements En Attente</h3>
              <p className="value">{status.consentPending}</p>
            </div>
            <div className="compliance-card">
              <h3>Demandes d'Export</h3>
              <p className="value">{status.exportRequests}</p>
            </div>
            <div className="compliance-card">
              <h3>Anonymisations</h3>
              <p className="value">{status.anonymizationRequests}</p>
            </div>
            <div className="compliance-card">
              <h3>Dernier Audit</h3>
              <p className="value">
                {new Date(status.lastAuditDate).toLocaleDateString()}
              </p>
            </div>
            <div className="compliance-card">
              <h3>Dernier Rapport PIPEDA</h3>
              <p className="value">
                {new Date(status.lastReportGenerated).toLocaleDateString()}
              </p>
            </div>
          </section>

          <div className="compliance-actions">
            <button
              onClick={handleAnonymizeClick}
              className="btn-warning"
            >
              Anonymiser Utilisateur
            </button>
            <button
              onClick={handleGenerateReportClick}
              className="btn-primary"
            >
              Générer Rapport PIPEDA
            </button>
          </div>

          <section className="info-section">
            <h2>Vérification Conformité</h2>
            <ul>
              <li>✓ Consentements explicites collectés et stockholés</li>
              <li>✓ Droit d'accès: Export JSON/CSV disponible</li>
              <li>✓ Droit à l'oubli: Anonymisation dans 90 jours</li>
              <li>✓ Droit à la portabilité: Export CSV généré à la demande</li>
              <li>✓ Minimisation des données: Audit régulier</li>
              <li>✓ AuditLogs immuables: Conservation 7 ans</li>
            </ul>
          </section>
        </>
      )}

      {tab === "exports" && (
        <>
          {exports.length > 0 ? (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Email</th>
                  <th>Statut</th>
                  <th>Demandé le</th>
                  <th>Expire</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {exports.map((exp) => (
                  <tr key={exp.id}>
                    <td data-label="User ID">{exp.userId.substring(0, 8)}</td>
                    <td data-label="Email">{exp.email}</td>
                    <td data-label="Statut">
                      <span className={`status-badge ${exp.status.toLowerCase()}`}>
                        {exp.status}
                      </span>
                    </td>
                    <td data-label="Demandé le">{new Date(exp.requestedAt).toLocaleDateString()}</td>
                    <td data-label="Expire">{exp.expiresAt ? new Date(exp.expiresAt).toLocaleDateString() : "-"}</td>
                    <td data-label="Actions">
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {exp.status === "Pending" && (
                          <button
                            onClick={() => handleProcessExport(exp.id)}
                            className="btn-primary"
                            disabled={actionLoading}
                          >
                            Traiter
                          </button>
                        )}
                        {exp.downloadUrl && (
                          <a
                            href={exp.downloadUrl}
                            className="btn-link"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Télécharger
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
              Aucune demande d'export.
            </div>
          )}
        </>
      )}

      <AdminModal
        isOpen={modalOpen && modalType === "anonymize"}
        title="Anonymiser un Utilisateur"
        hasInput
        inputRows={2}
        inputPlaceholder="ID de l'utilisateur"
        inputValue={anonymizeInput.userId}
        onInputChange={(value) =>
          setAnonymizeInput((prev) => ({ ...prev, userId: value }))
        }
        confirmText="Anonymiser"
        cancelText="Annuler"
        isDangerous
        isLoading={actionLoading}
        onConfirm={handleConfirmAnonymize}
        onClose={() => setModalOpen(false)}
      >
        <div style={{ marginTop: "-10px" }}>
          <label style={{ marginTop: "16px" }}>Raison:</label>
          <textarea
            value={anonymizeInput.reason}
            onChange={(e) =>
              setAnonymizeInput((prev) => ({ ...prev, reason: e.target.value }))
            }
            placeholder="Ex: Demande PIPEDA de l'utilisateur"
            rows={3}
            style={{
              width: "100%",
              padding: "10px 12px",
              border: "1px solid #e0e4e8",
              borderRadius: "8px",
              fontFamily: "inherit",
              fontSize: "14px",
              marginTop: "8px",
            }}
          />
        </div>
      </AdminModal>

      <AdminModal
        isOpen={modalOpen && modalType === "reportDates"}
        title="Générer Rapport PIPEDA"
        message="Choisissez la période pour le rapport."
        confirmText="Générer"
        cancelText="Annuler"
        isLoading={actionLoading}
        onConfirm={handleConfirmReportDates}
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
