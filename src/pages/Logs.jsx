const sampleLogs = [
  { id: 1, date: "2026-04-11 09:14", event: "Connexion admin", user: "admin@lacitec.on.ca", severity: "Info" },
  { id: 2, date: "2026-04-11 08:52", event: "Validation conducteur", user: "melissa.j@lacitec.on.ca", severity: "Info" },
  { id: 3, date: "2026-04-10 17:30", event: "Suspension utilisateur", user: "sara.b@lacitec.on.ca", severity: "Attention" },
  { id: 4, date: "2026-04-09 15:10", event: "Export donnees", user: "admin@lacitec.on.ca", severity: "Info" },
  { id: 5, date: "2026-04-09 14:28", event: "Rapport cree", user: "admin@lacitec.on.ca", severity: "Info" },
  { id: 6, date: "2026-04-08 11:45", event: "Modification parametre", user: "admin@lacitec.on.ca", severity: "Info" },
];

export default function Logs() {
  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, color: "#64748b" }}>Journal de lapplication</p>
        <h1 style={{ margin: "8px 0 0" }}>Logs d''audit</h1>
      </header>

      <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
        <input placeholder="Chercher un evenement..." style={{ flex: 1, padding: 12, borderRadius: 10, border: "1px solid #cbd5e1" }} />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ background: "#f8fafc", color: "#334155", textAlign: "left" }}>
              <th style={thStyle}>Date</th>
              <th style={thStyle}>Evenement</th>
              <th style={thStyle}>Utilisateur</th>
              <th style={thStyle}>Niveau</th>
            </tr>
          </thead>
          <tbody>
            {sampleLogs.map((log) => (
              <tr key={log.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={tdStyle}>{log.date}</td>
                <td style={tdStyle}>{log.event}</td>
                <td style={tdStyle}>{log.user}</td>
                <td style={{ ...tdStyle, color: log.severity === "Attention" ? "#b45309" : "#2563eb" }}>{log.severity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = { padding: "14px 12px", fontSize: 14, fontWeight: 600 };
const tdStyle = { padding: "14px 12px", fontSize: 14, color: "#0f172a" };
