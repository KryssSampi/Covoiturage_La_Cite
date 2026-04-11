import { useEffect, useState } from "react";
import api from "../services/admin.api";

const samplePending = [
  { _id: "driver1", name: "Hugo B.", email: "hugo.b@lacitec.on.ca", vehicle: "Hyundai Elantra", seats: 3, license: "Valide", insurance: "Valide", documents: ["Permis", "Assurance", "Casier"] },
  { _id: "driver2", name: "Lina M.", email: "lina.m@lacitec.on.ca", vehicle: "Toyota Corolla", seats: 2, license: "Valide", insurance: "Manquante", documents: ["Permis"] },
];

const sampleApproved = [
  { _id: "driver3", name: "Marc L.", email: "marc.l@lacitec.on.ca", vehicle: "Kia Soul", seats: 4, trips: 52, rating: 4.9, status: "Actif" },
  { _id: "driver4", name: "Chloe P.", email: "chloe.p@lacitec.on.ca", vehicle: "Honda Civic", seats: 3, trips: 28, rating: 4.8, status: "Actif" },
];

export default function Drivers() {
  const [pending, setPending] = useState(samplePending);
  const [approved, setApproved] = useState(sampleApproved);

  useEffect(() => {
    api.get("/drivers/pending")
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setPending(res.data);
        }
      })
      .catch(() => {
        // Keep samplePending as fallback
      });

    api.get("/drivers/approved")
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setApproved(res.data);
        }
      })
      .catch(() => {
        // Keep sampleApproved as fallback
      });
  }, []);

  const approve = (id) => {
    setPending((prev) => prev.filter((driver) => driver._id !== id));
    const driver = pending.find((driver) => driver._id === id);
    if (driver) {
      setApproved((prev) => [...prev, { ...driver, trips: 0, rating: 0, status: "Actif" }]);
    }
    api.post(`/drivers/${id}/approve`).catch(() => {});
  };

  const reject = (id) => {
    setPending((prev) => prev.filter((driver) => driver._id !== id));
    api.post(`/drivers/${id}/reject`).catch(() => {});
  };

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, color: "#64748b" }}>Validation des conducteurs</p>
          <h1 style={{ margin: "8px 0 0" }}>Conducteurs en attente</h1>
        </div>
        <span style={{ padding: "8px 14px", borderRadius: 9999, background: "#dbeafe", color: "#1d4ed8" }}>En attente : {pending.length}</span>
      </header>

      {pending.length === 0 ? (
        <div style={{ padding: 24, border: "1px solid #e2e8f0", borderRadius: 16, background: "#f8fafc" }}>
          Aucun conducteur en attente. Toutes les validations sont a jour.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 16, marginBottom: 30 }}>
          {pending.map((driver) => (
            <div key={driver._id} style={{ border: "1px solid #e2e8f0", borderRadius: 16, padding: 20, background: "#ffffff" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h2 style={{ margin: 0 }}>{driver.name}</h2>
                  <p style={{ margin: "8px 0 0", color: "#475569" }}>{driver.email}</p>
                </div>
                <span style={{ color: "#b45309", fontWeight: 600 }}>En attente</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 16, marginTop: 18 }}>
                <div><strong>Vehicule</strong><p style={{ margin: "6px 0 0" }}>{driver.vehicle}</p></div>
                <div><strong>Places</strong><p style={{ margin: "6px 0 0" }}>{driver.seats}</p></div>
                <div><strong>Permis</strong><p style={{ margin: "6px 0 0" }}>{driver.license}</p></div>
              </div>
              <div>
                <strong style={{ display: "block", marginTop: 16 }}>Documents</strong>
                <p style={{ margin: "6px 0 0", color: "#475569" }}>{driver.documents.join(", ")}</p>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
                <button onClick={() => approve(driver._id)} style={approveButton}>Approuver</button>
                <button onClick={() => reject(driver._id)} style={rejectButton}>Refuser</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <section style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 }}>
        <h2>Conducteurs valides</h2>
        <p style={{ color: "#64748b", marginBottom: 18 }}>Total : {approved.length}</p>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
            <thead>
              <tr style={{ background: "#f8fafc", color: "#334155", textAlign: "left" }}>
                <th style={thStyle}>Nom</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Vehicule</th>
                <th style={thStyle}>Trajets</th>
                <th style={thStyle}>Note</th>
                <th style={thStyle}>Statut</th>
              </tr>
            </thead>
            <tbody>
              {approved.map((driver) => (
                <tr key={driver._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={tdStyle}>{driver.name}</td>
                  <td style={tdStyle}>{driver.email}</td>
                  <td style={tdStyle}>{driver.vehicle}</td>
                  <td style={tdStyle}>{driver.trips}</td>
                  <td style={tdStyle}>{driver.rating.toFixed(1)}</td>
                  <td style={{ ...tdStyle, color: "#15803d" }}>{driver.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const thStyle = { padding: "14px 12px", fontSize: 14, fontWeight: 600 };
const tdStyle = { padding: "14px 12px", fontSize: 14, color: "#0f172a" };
const approveButton = { padding: "10px 16px", borderRadius: 10, background: "#16a34a", color: "#fff", border: "none", cursor: "pointer" };
const rejectButton = { padding: "10px 16px", borderRadius: 10, background: "#ef4444", color: "#fff", border: "none", cursor: "pointer" };
