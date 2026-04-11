export default function StatsCard({ title, value, description }) {
  return (
    <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20, minHeight: 120, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div>
        <h4 style={{ margin: 0, fontSize: 16, color: "#0f172a" }}>{title}</h4>
        <p style={{ margin: "10px 0 0", color: "#64748b", fontSize: 13 }}>{description}</p>
      </div>
      <div style={{ marginTop: 16 }}>
        <strong style={{ fontSize: 28, color: "#111827" }}>{value ?? "—"}</strong>
      </div>
    </div>
  );
}
