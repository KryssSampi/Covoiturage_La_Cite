import { useEffect, useState } from "react";
import { fetchStats } from "../services/stats.service";
import CO2Chart from "../components/CO2Chart";

const metricCards = [
  { label: "Trajets confirmes", value: 128, description: "Trajets valides ce mois" },
  { label: "Correspondances reussies", value: "86%", description: "Pertinence du matching" },
  { label: "Zones campus actives", value: 5, description: "Points de depart reconnus" },
  { label: "Utilisateurs satisfaits", value: "92%", description: "Score de satisfaction general" },
];

export default function Statistics() {
  const [stats, setStats] = useState({ co2Saved: 1840, ridesPerWeek: 45, driversOnline: 72, avgRating: 4.7 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats()
      .then((data) => setStats({ ...stats, ...data }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, color: "#64748b" }}>Indicateurs cles</p>
        <h1 style={{ margin: "8px 0 0" }}>Statistiques du service</h1>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 16, marginBottom: 24 }}>
        {metricCards.map((card) => (
          <div key={card.label} style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
            <p style={{ margin: 0, color: "#64748b", fontSize: 13 }}>{card.label}</p>
            <p style={{ margin: "10px 0 0", fontSize: 28, fontWeight: 700, color: "#0f172a" }}>{card.value}</p>
            <p style={{ margin: "10px 0 0", color: "#475569", fontSize: 13 }}>{card.description}</p>
          </div>
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginBottom: 18 }}>Economies de CO2</h2>
          <CO2Chart value={stats.co2Saved} />
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
          <h2 style={{ marginBottom: 18 }}>Tendances principales</h2>
          <div style={{ display: "grid", gap: 18 }}>
            <div style={{ padding: "16px", background: "#f8fafc", borderRadius: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Trajets par semaine</h3>
              <p style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{stats.ridesPerWeek} trajets</p>
            </div>
            <div style={{ padding: "16px", background: "#f8fafc", borderRadius: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Conducteurs en ligne</h3>
              <p style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{stats.driversOnline} conducteurs</p>
            </div>
            <div style={{ padding: "16px", background: "#f8fafc", borderRadius: 12 }}>
              <h3 style={{ margin: 0, fontSize: 14, color: "#64748b" }}>Note moyenne</h3>
              <p style={{ margin: "8px 0 0", fontSize: 20, fontWeight: 700, color: "#0f172a" }}>{stats.avgRating.toFixed(1)}/5.0</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
