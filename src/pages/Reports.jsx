import { useEffect, useState } from "react";
import api from "../services/admin.api";

const sampleReports = [
  { _id: "report1", user: "Amelie T.", type: "Comportement", details: "Retard du conducteur", status: "Ouvert", date: "2026-04-08", priority: "Normal" },
  { _id: "report2", user: "Victor R.", type: "Securite", details: "Point de rendez-vous incorrect", status: "En cours", date: "2026-04-09", priority: "Urgent" },
  { _id: "report3", user: "Lina M.", type: "Annulation", details: "Annulation de derniere minute", status: "Resolu", date: "2026-04-06", priority: "Normal" },
  { _id: "report4", user: "Hugo B.", type: "Communication", details: "Probleme de contact avec passager", status: "Ouvert", date: "2026-04-10", priority: "Normal" },
];

export default function Reports() {
  const [reports, setReports] = useState(sampleReports);

  useEffect(() => {
    api.get("/reports")
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setReports(res.data);
        }
      })
      .catch(() => {
        // Keep sampleReports as fallback
      });
  }, []);

  const updateStatus = (id, nextStatus) => {
    setReports((prev) => prev.map((report) => (report._id === id ? { ...report, status: nextStatus } : report)));
  };

  const openCount = reports.filter((r) => r.status === "Ouvert").length;
  const inProgressCount = reports.filter((r) => r.status === "En cours").length;

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, color: "#64748b" }}>Suivi des signalements</p>
          <h1 style={{ margin: "8px 0 0" }}>Rapports utilisateurs</h1>
        </div>
        <div style={{ display: "grid", gap: 10, textAlign: "right" }}>
          <span style={{ padding: "8px 14px", borderRadius: 9999, background: "#fee2e2", color: "#b91c1c" }}>Ouverts : {openCount}</span>
          <span style={{ padding: "8px 14px", borderRadius: 9999, background: "#fef3c7", color: "#92400e" }}>En cours : {inProgressCount}</span>
        </div>
      </header>

      <div style={{ display: "grid", gap: 16 }}>
        {reports.map((report) => (
          <div key={report._id} style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 20, background: "#fff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <h2 style={{ margin: 0 }}>{report.type}</h2>
                  <span style={{ padding: "4px 10px", borderRadius: 9999, fontSize: 12, background: report.priority === "Urgent" ? "#fee2e2" : "#fef3c7", color: report.priority === "Urgent" ? "#b91c1c" : "#92400e" }}>{report.priority}</span>
                </div>
                <p style={{ margin: "8px 0 0", color: "#475569" }}>{report.details}</p>
                <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 13 }}>De : {report.user}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ margin: 0, color: "#64748b" }}>{report.date}</p>
                <span style={{ display: "inline-block", marginTop: 8, padding: "6px 12px", borderRadius: 9999, background: report.status === "Resolu" ? "#dcfce7" : report.status === "Ouvert" ? "#fee2e2" : "#fef3c7", color: report.status === "Resolu" ? "#166534" : report.status === "Ouvert" ? "#b91c1c" : "#92400e" }}>{report.status}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
              <button onClick={() => updateStatus(report._id, "En cours")} style={smallButton}>Traiter</button>
              <button onClick={() => updateStatus(report._id, "Resolu")} style={resolveButton}>Marquer resolu</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const smallButton = { padding: "10px 16px", borderRadius: 10, background: "#2563eb", color: "#fff", border: "none", cursor: "pointer" };
const resolveButton = { padding: "10px 16px", borderRadius: 10, background: "#16a34a", color: "#fff", border: "none", cursor: "pointer" };
