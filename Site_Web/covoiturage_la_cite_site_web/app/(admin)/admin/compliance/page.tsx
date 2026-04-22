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

export default function AdminCompliancePage() {
  const [status, setStatus] = useState<ComplianceStatus | null>(null);
  const [exports, setExports] = useState<UserExport[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"overview" | "exports">("overview");

  useEffect(() => {
    loadData();
  }, [tab]);

  const loadData = async () => {
    try {
      const statusData = await getComplianceStatusAction();
      setStatus(statusData);
      if (tab === "exports") {
        const exportsData = await getExportRequestsAction();
        setExports(exportsData);
      }
    } catch (error) {
      console.error("Erreur chargement compliance:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessExport = async (exportId: string) => {
    try {
      await processExportAction(exportId);
      await loadData();
      alert("Export traité!");
    } catch (error) {
      console.error("Erreur traitement:", error);
    }
  };

  const handleAnonymizeUser = async () => {
    const userId = prompt("ID utilisateur à anonymiser:");
    if (!userId) return;
    const reason = prompt("Raison de l'anonymisation:");
    if (!reason) return;

    try {
      await anonymizeUserAction(userId, reason);
      alert("Utilisateur anonymisé!");
    } catch (error) {
      console.error("Erreur anonymisation:", error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      await generateComplianceReportAction();
      alert("Rapport PIPEDA généré!");
    } catch (error) {
      console.error("Erreur rapport:", error);
    }
  };

  if (loading) return <div>Chargement...</div>;

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
            <button onClick={handleAnonymizeUser} className="btn-warning">
              Anonymiser Utilisateur
            </button>
            <button onClick={handleGenerateReport} className="btn-primary">
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
                <td>{exp.userId.substring(0, 8)}</td>
                <td>{exp.email}</td>
                <td>
                  <span className={`status-badge ${exp.status.toLowerCase()}`}>
                    {exp.status}
                  </span>
                </td>
                <td>{new Date(exp.requestedAt).toLocaleDateString()}</td>
                <td>{exp.expiresAt ? new Date(exp.expiresAt).toLocaleDateString() : "-"}</td>
                <td>
                  {exp.status === "Pending" && (
                    <button
                      onClick={() => handleProcessExport(exp.id)}
                      className="btn-primary"
                    >
                      Traiter
                    </button>
                  )}
                  {exp.downloadUrl && (
                    <a href={exp.downloadUrl} className="btn-link">
                      Télécharger
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === "exports" && exports.length === 0 && (
        <p>Aucune demande d'export.</p>
      )}
    </>
  );
}
