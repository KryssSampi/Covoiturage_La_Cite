import { useState } from "react";
import { exportStats } from "../services/export.service";

export default function Exports() {
  const [message, setMessage] = useState("");

  const handleExport = async (format) => {
    try {
      await exportStats(format);
      setMessage(`Export ${format.toUpperCase()} lance avec succes.`);
      setTimeout(() => setMessage(""), 5000);
    } catch {
      setMessage(`Impossible de generer un export ${format.toUpperCase()} pour le moment.`);
      setTimeout(() => setMessage(""), 5000);
    }
  };

  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, color: "#64748b" }}>Exports de donnees</p>
        <h1 style={{ margin: "8px 0 0" }}>Telecharger les rapports</h1>
      </header>

      <div style={{ display: "grid", gap: 16, maxWidth: 700 }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
          <h2>Exporter les donnees</h2>
          <p style={{ color: "#475569", marginBottom: 18 }}>Exportez les statistiques, les rapports et les donnees utilisateurs au format CSV, PDF ou JSON.</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={() => handleExport("csv")} style={exportButton}>Exporter CSV</button>
            <button onClick={() => handleExport("pdf")} style={exportButton}>Exporter PDF</button>
            <button onClick={() => handleExport("json")} style={exportButton}>Exporter JSON</button>
          </div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
          <h2>Options supplementaires</h2>
          <div style={{ display: "grid", gap: 12 }}>
            <button onClick={() => handleExport("sql")} style={secondaryExportButton}>Export BDD (SQL)</button>
            <button onClick={() => handleExport("xlsx")} style={secondaryExportButton}>Export classeur (XLSX)</button>
          </div>
        </div>

        {message && (
          <div style={{ color: "#0f172a", background: "#f8fafc", padding: 16, borderRadius: 14, border: "1px solid #e2e8f0" }}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

const exportButton = { padding: "12px 18px", borderRadius: 10, background: "#2563eb", color: "#fff", border: "none", cursor: "pointer" };
const secondaryExportButton = { padding: "12px 18px", borderRadius: 10, background: "#f8fafc", color: "#1f2937", border: "1px solid #cbd5e1", cursor: "pointer" };
