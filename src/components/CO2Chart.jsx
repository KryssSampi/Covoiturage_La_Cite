export default function CO2Chart({ value }) {
  const percentage = Math.min(100, Math.round((value / 5000) * 100));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <p style={{ margin: 0, color: "#64748b" }}>CO2 économisé</p>
          <h2 style={{ margin: "8px 0 0" }}>{value} kg</h2>
        </div>
        <span style={{ padding: "8px 14px", borderRadius: 9999, background: "#dcfce7", color: "#166534" }}>{percentage}% de l’objectif</span>
      </div>
      <div style={{ background: "#e2e8f0", borderRadius: 9999, height: 16, overflow: "hidden" }}>
        <div style={{ width: `${percentage}%`, height: "100%", background: "#16a34a" }} />
      </div>
      <p style={{ marginTop: 16, color: "#475569" }}>Objectif annuel : 5 000 kg de CO2 économisés pour la communauté LaCité.</p>
    </div>
  );
}
