import { useEffect, useMemo, useState } from "react";
import api from "../services/admin.api";

const sampleRides = [
  { _id: "ride1", driver: "Amelie T.", from: "Orleans", to: "Campus LaCite", departure: "08:15", seats: "1/3", status: "Confirme", occupancy: 33 },
  { _id: "ride2", driver: "Lucas G.", from: "Vanier", to: "Campus LaCite", departure: "08:45", seats: "2/2", status: "Complet", occupancy: 100 },
  { _id: "ride3", driver: "Sara B.", from: "Gatineau", to: "Campus LaCite", departure: "07:30", seats: "3/4", status: "En attente", occupancy: 75 },
];

export default function Rides() {
  const [rides, setRides] = useState(sampleRides);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("tous");

  useEffect(() => {
    api.get("/rides")
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setRides(res.data);
        }
      })
      .catch(() => {
        // Keep sampleRides as fallback
      });
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();
    return rides.filter((ride) => {
      const matchesQuery = [ride.driver, ride.from, ride.to].some((field) => field.toLowerCase().includes(query));
      const matchesStatus = status === "tous" || ride.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [rides, search, status]);

  const cancelRide = (id) => {
    setRides((prev) => prev.map((ride) => (ride._id === id ? { ...ride, status: "Annule" } : ride)));
  };

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, color: "#64748b" }}>Gestion des trajets</p>
          <h1 style={{ margin: "8px 0 0" }}>Trajets disponibles</h1>
        </div>
        <div style={{ display: "grid", gap: 10, textAlign: "right" }}>
          <span style={{ padding: "8px 14px", borderRadius: 9999, background: "#e0f2fe", color: "#0c4a6e" }}>Total : {rides.length}</span>
          <span style={{ padding: "8px 14px", borderRadius: 9999, background: "#dcfce7", color: "#166534" }}>Actifs : {rides.filter((r) => r.status !== "Annule").length}</span>
        </div>
      </header>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher trajet..."
          style={{ flex: 1, minWidth: 220, padding: 12, borderRadius: 10, border: "1px solid #cbd5e1" }}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #cbd5e1" }}>
          <option value="tous">Tous les statuts</option>
          <option value="Confirme">Confirme</option>
          <option value="En attente">En attente</option>
          <option value="Complet">Complet</option>
          <option value="Annule">Annule</option>
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr style={{ background: "#f8fafc", color: "#334155", textAlign: "left" }}>
              <th style={thStyle}>Conducteur</th>
              <th style={thStyle}>Depart</th>
              <th style={thStyle}>Arrivee</th>
              <th style={thStyle}>Heure</th>
              <th style={thStyle}>Places</th>
              <th style={thStyle}>Occupation</th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ride) => (
              <tr key={ride._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={tdStyle}>{ride.driver}</td>
                <td style={tdStyle}>{ride.from}</td>
                <td style={tdStyle}>{ride.to}</td>
                <td style={tdStyle}>{ride.departure}</td>
                <td style={tdStyle}>{ride.seats}</td>
                <td style={tdStyle}>
                  <div style={{ background: "#e2e8f0", borderRadius: 9999, height: 8, width: 50, overflow: "hidden" }}>
                    <div style={{ width: `${ride.occupancy}%`, height: "100%", background: "#16a34a" }} />
                  </div>
                </td>
                <td style={{ ...tdStyle, color: ride.status === "Confirme" ? "#15803d" : ride.status === "Annule" ? "#b91c1c" : "#d97706" }}>{ride.status}</td>
                <td style={tdStyle}>
                  <button onClick={() => cancelRide(ride._id)} style={cancelButton}>Annuler</button>
                </td>
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
const cancelButton = { padding: "8px 12px", borderRadius: 10, background: "#ef4444", color: "#fff", border: "none", cursor: "pointer" };
