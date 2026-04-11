import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchStats } from "../services/stats.service";
import StatsCard from "../components/StatsCard";

const fallbackStats = {
  users: 1284,
  activeDrivers: 72,
  pendingValidations: 12,
  ridesToday: 49,
  requestsThisWeek: 163,
  co2Saved: 1840,
  reports: 7,
};

export default function Dashboard() {
  const [stats, setStats] = useState(fallbackStats);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats()
      .then((data) => {
        setStats({ ...fallbackStats, ...data });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: "Utilisateurs actifs", value: stats.users, description: "Membres cadastres LaCite" },
    { title: "Conducteurs actifs", value: stats.activeDrivers, description: "Conducteurs valides et disponibles" },
    { title: "Demandes cette semaine", value: stats.requestsThisWeek, description: "Reservations et demandes traitees" },
    { title: "CO2 economise/an", value: `${stats.co2Saved} kg`, description: "Reduction estimee des emissions" },
    { title: "Validations en attente", value: stats.pendingValidations, description: "Profils conducteurs a examiner" },
    { title: "Signalements ouverts", value: stats.reports, description: "Problemes a suivre" },
  ];

  return (
    <div>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, color: "#64748b" }}>Tableau de bord administratif</p>
          <h1 style={{ margin: "8px 0 0" }}>Bienvenue sur LaCite Admin</h1>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontWeight: 600 }}>Statut</p>
          <span style={{ display: "inline-block", padding: "8px 14px", borderRadius: 9999, background: "#d1fae5", color: "#166534" }}>En ligne</span>
        </div>
      </header>

      {loading && <p>Chargement des statistiques...</p>}

      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginBottom: 24 }}>
        {cards.map((card) => (
          <StatsCard key={card.title} title={card.title} value={card.value} description={card.description} />
        ))}
      </section>

      <section style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20, marginBottom: 24 }}>
        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
          <h2>Actions rapides</h2>
          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            <button onClick={() => navigate("/admin/users")} style={buttonStyle}>Gerer les utilisateurs</button>
            <button onClick={() => navigate("/admin/drivers")} style={buttonStyle}>Valider les conducteurs</button>
            <button onClick={() => navigate("/admin/rides")} style={buttonStyle}>Consulter les trajets</button>
            <button onClick={() => navigate("/admin/reports")} style={buttonStyle}>Voir les signalements</button>
            <button onClick={() => navigate("/admin/statistics")} style={buttonStyle}>Statistiques detaillees</button>
          </div>
        </div>

        <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
          <h2>Objectifs clés</h2>
          <ul style={{ paddingLeft: 20, color: "#475569", lineHeight: 1.8 }}>
            <li>Accessibilite domicile-campus</li>
            <li>Reduction des couts et CO2</li>
            <li>Gestion securisee des roles</li>
            <li>Confidentialite des donnees</li>
          </ul>
        </div>
      </section>

      <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <h2>Resume des trajets recents</h2>
            <p style={{ margin: 0, color: "#64748b" }}>Derniers trajets valides et demandes en cours</p>
          </div>
          <button onClick={() => navigate("/admin/rides")} style={secondaryButtonStyle}>Voir tous les trajets</button>
        </div>

        <div style={{ width: "100%", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid #e2e8f0" }}>
                <th style={tableHeader}>Conducteur</th>
                <th style={tableHeader}>Depart</th>
                <th style={tableHeader}>Arrivee</th>
                <th style={tableHeader}>Places</th>
                <th style={tableHeader}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentRides.map((ride) => (
                <tr key={ride.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={tableCell}>{ride.driver}</td>
                  <td style={tableCell}>{ride.from}</td>
                  <td style={tableCell}>{ride.to}</td>
                  <td style={tableCell}>{ride.seats}</td>
                  <td style={{ ...tableCell, color: ride.status === "Confirme" ? "#15803d" : "#b45309" }}>{ride.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const buttonStyle = {
  width: "100%",
  padding: "12px 16px",
  border: "none",
  borderRadius: 10,
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "10px 16px",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  background: "#f8fafc",
  color: "#1f2937",
  cursor: "pointer",
};

const recentRides = [
  { id: 1, driver: "Amelie T.", from: "Orleans", to: "Campus LaCite", seats: "2/4", status: "Confirme" },
  { id: 2, driver: "Lucas G.", from: "Vanier", to: "Campus LaCite", seats: "1/3", status: "En attente" },
  { id: 3, driver: "Sara B.", from: "Gatineau", to: "Campus LaCite", seats: "3/4", status: "Confirme" },
];

const tableHeader = {
  padding: "12px 10px",
  fontSize: 14,
  color: "#475569",
};

const tableCell = {
  padding: "14px 10px",
  fontSize: 14,
  color: "#1f2937",
};
