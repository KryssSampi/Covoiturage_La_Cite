"use client";

import { useEffect, useState } from "react";
import {
  getReportsAction,
  updateReportStatusAction,
  dismissReportAction,
  Report,
} from "@/features/admin/services/admin.actions";

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [filter, setFilter] = useState<"Open" | "InReview" | "Resolved" | "All">("Open");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    try {
      const data = await getReportsAction();
      const filtered = filter === "All" ? data : data.filter((r) => r.status === filter);
      setReports(filtered);
    } catch (error) {
      console.error("Erreur chargement reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (reportId: string, newStatus: string) => {
    try {
      await updateReportStatusAction(reportId, newStatus);
      await loadReports();
    } catch (error) {
      console.error("Erreur mise à jour:", error);
    }
  };

  const handleDismiss = async (reportId: string) => {
    const reason = prompt("Raison du rejet:");
    if (reason) {
      try {
        await dismissReportAction(reportId, reason);
        await loadReports();
      } catch (error) {
        console.error("Erreur rejet:", error);
      }
    }
  };

  if (loading) return <div>Chargement...</div>;

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
              <td>{report.id.substring(0, 8)}</td>
              <td>{report.category}</td>
              <td>{report.userId.substring(0, 8)}</td>
              <td>{report.reportedUserId.substring(0, 8)}</td>
              <td>
                <span className={`severity-badge ${report.severity.toLowerCase()}`}>
                  {report.severity}
                </span>
              </td>
              <td>
                <select
                  value={report.status}
                  onChange={(e) => handleStatusUpdate(report.id, e.target.value)}
                >
                  <option value="Open">Ouvert</option>
                  <option value="InReview">En révision</option>
                  <option value="Resolved">Résolu</option>
                </select>
              </td>
              <td>{new Date(report.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleDismiss(report.id)} className="btn-danger">
                  Rejeter
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {reports.length === 0 && <p>Aucun signalement à afficher.</p>}
    </>
  );
}
