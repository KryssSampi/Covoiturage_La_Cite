"use client";

import { useEffect, useState } from "react";
import {
  createExportAction,
  getExportsAction,
  Export,
} from "@/features/admin/services/admin.exports.actions";
import { useAdminToast, AdminToastContainer } from "@/features/admin/components/AdminToast";

export default function AdminExportsPage() {
  const [exportsData, setExportsData] = useState<Export[]>([]);
  const [type, setType] = useState("users");
  const [format, setFormat] = useState("json");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { toasts, removeToast, success, error } = useAdminToast();

  useEffect(() => {
    loadExports();
  }, []);

  const loadExports = async () => {
    try {
      const data = await getExportsAction();
      setExportsData(data);
    } catch (err) {
      console.error("Erreur chargement exports:", err);
      error("Erreur lors du chargement des exports");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExport = async () => {
    setCreating(true);
    try {
      await createExportAction({ type, format });
      success("Export lancé avec succès.");
      await loadExports();
    } catch (err) {
      console.error("Erreur création export:", err);
      error("Impossible de lancer l'export.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1>Exports de Données</h1>
        <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
          Chargement des exports...
        </div>
      </div>
    );
  }

  return (
    <>
      <h1>Exports de Données</h1>

      <section className="settings-section">
        <h2>Nouvel Export</h2>
        <div className="setting-item">
          <label>Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="users">Utilisateurs</option>
            <option value="trips">Trajets</option>
            <option value="finance">Finances</option>
            <option value="co2">CO₂</option>
          </select>
        </div>

        <div className="setting-item">
          <label>Format:</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>

        <button
          className="btn-primary"
          onClick={handleCreateExport}
          disabled={creating}
        >
          {creating ? "Création..." : "Lancer Export"}
        </button>
      </section>

      <section>
        <h2>Historique</h2>
        {exportsData.length > 0 ? (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Format</th>
                <th>Statut</th>
                <th>Créé le</th>
                <th>Expire le</th>
                <th>Fichier</th>
              </tr>
            </thead>
            <tbody>
              {exportsData.map((exp) => (
                <tr key={exp.id}>
                  <td data-label="ID">{exp.id.substring(0, 8)}</td>
                  <td data-label="Type">{exp.type}</td>
                  <td data-label="Format">{exp.format ?? "-"}</td>
                  <td data-label="Statut">
                    <span className={`status-badge ${exp.status.toLowerCase()}`}>
                      {exp.status}
                    </span>
                  </td>
                  <td data-label="Créé le">
                    {new Date(exp.createdAt).toLocaleDateString()}
                  </td>
                  <td data-label="Expire le">
                    {exp.expiresAt ? new Date(exp.expiresAt).toLocaleDateString() : "-"}
                  </td>
                  <td data-label="Fichier">
                    {exp.downloadUrl ? (
                      <a
                        href={exp.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-link"
                      >
                        Télécharger
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#666" }}>
            Aucun export disponible.
          </div>
        )}
      </section>

      <AdminToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
