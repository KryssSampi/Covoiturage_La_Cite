"use client";

import { useEffect, useState } from "react";
import {
  createExportAction,
  getExportsAction,
  Export,
} from "@/features/admin/services/admin.exports.actions";

export default function AdminExportsPage() {
  const [exportsData, setExportsData] = useState<Export[]>([]);
  const [type, setType] = useState("users");
  const [format, setFormat] = useState("json");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadExports();
  }, []);

  const loadExports = async () => {
    try {
      const data = await getExportsAction();
      setExportsData(data);
    } catch (error) {
      console.error("Erreur chargement exports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExport = async () => {
    setCreating(true);
    try {
      await createExportAction({ type, format });
      await loadExports();
      alert("Export lance avec succes.");
    } catch (error) {
      console.error("Erreur creation export:", error);
      alert("Impossible de lancer l'export.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) return <div>Chargement...</div>;

  return (
    <>
      <h1>Exports de donnees</h1>

      <section className="settings-section">
        <h2>Nouvel export</h2>
        <div className="setting-item">
          <label>Type:</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="users">Utilisateurs</option>
            <option value="trips">Trajets</option>
            <option value="finance">Finances</option>
            <option value="co2">CO2</option>
          </select>
        </div>

        <div className="setting-item">
          <label>Format:</label>
          <select value={format} onChange={(e) => setFormat(e.target.value)}>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>

        <button className="btn-primary" onClick={handleCreateExport} disabled={creating}>
          {creating ? "Creation..." : "Lancer export"}
        </button>
      </section>

      <section>
        <h2>Historique</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Format</th>
              <th>Statut</th>
              <th>Cree le</th>
              <th>Expire le</th>
              <th>Fichier</th>
            </tr>
          </thead>
          <tbody>
            {exportsData.map((exp) => (
              <tr key={exp.id}>
                <td>{exp.id.substring(0, 8)}</td>
                <td>{exp.type}</td>
                <td>{exp.format ?? "-"}</td>
                <td>{exp.status}</td>
                <td>{new Date(exp.createdAt).toLocaleDateString()}</td>
                <td>{exp.expiresAt ? new Date(exp.expiresAt).toLocaleDateString() : "-"}</td>
                <td>
                  {exp.downloadUrl ? (
                    <a href={exp.downloadUrl} target="_blank" rel="noreferrer">
                      Telecharger
                    </a>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {exportsData.length === 0 && <p>Aucun export disponible.</p>}
      </section>
    </>
  );
}
