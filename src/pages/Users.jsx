import { useEffect, useMemo, useState } from "react";
import api from "../services/admin.api";

const sampleUsers = [
  { _id: "1", email: "amelie.t@lacitec.on.ca", name: "Amelie Thibault", role: "passager", status: "actif", rides: 24, rating: 4.9 },
  { _id: "2", email: "lucas.g@lacitec.on.ca", name: "Lucas Gauthier", role: "conducteur", status: "actif", rides: 38, rating: 4.8 },
  { _id: "3", email: "sara.b@lacitec.on.ca", name: "Sara Bouchard", role: "passager", status: "suspendu", rides: 5, rating: 3.7 },
  { _id: "4", email: "admin@lacitec.on.ca", name: "Admin LaCite", role: "admin", status: "actif", rides: 0, rating: 5.0 },
  { _id: "5", email: "marc.l@lacitec.on.ca", name: "Marc Levesque", role: "conducteur", status: "actif", rides: 52, rating: 4.9 },
  { _id: "6", email: "marc@lacitec.on.ca", name: "Marc Levesque", role: "conducteur", status: "actif", rides: 52, rating: 4.9 },
];

export default function Users() {
  const [users, setUsers] = useState(sampleUsers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("tous");
  const [sortBy, setSortBy] = useState("name");

  useEffect(() => {
    api.get("/users")
      .then((res) => {
        if (res.data && Array.isArray(res.data) && res.data.length > 0) {
          setUsers(res.data);
        }
      })
      .catch(() => {
        // Keep sampleUsers as fallback
      });
  }, []);

  const filteredUsers = useMemo(() => {
    const term = search.toLowerCase().trim();
    let result = users.filter((user) => {
      const matchesSearch = [user.email, user.name, user.role].some((value) =>
        String(value).toLowerCase().includes(term)
      );
      const matchesStatus = statusFilter === "tous" || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "rides") return b.rides - a.rides;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
    return result;
  }, [users, search, statusFilter, sortBy]);

  const toggleStatus = (id) => {
    setUsers((prev) =>
      prev.map((user) =>
        user._id === id
          ? { ...user, status: user.status === "actif" ? "suspendu" : "actif" }
          : user
      )
    );
    api.patch(`/users/${id}/suspend`).catch(() => {});
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.status === "actif").length,
    suspended: users.filter((u) => u.status === "suspendu").length,
  };

  return (
    <div>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
        <div>
          <p style={{ margin: 0, color: "#64748b" }}>Gestion des utilisateurs</p>
          <h1 style={{ margin: "8px 0 0" }}>Utilisateurs LaCite</h1>
        </div>
        <div style={{ display: "grid", gap: 10, textAlign: "right" }}>
          <span style={{ padding: "8px 14px", borderRadius: 9999, background: "#d1fae5", color: "#166534" }}>Total : {stats.total}</span>
          <span style={{ padding: "8px 14px", borderRadius: 9999, background: "#dbeafe", color: "#1d4ed8" }}>Actifs : {stats.active}</span>
          <span style={{ padding: "8px 14px", borderRadius: 9999, background: "#fee2e2", color: "#b91c1c" }}>Suspendus : {stats.suspended}</span>
        </div>
      </header>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
        <input
          placeholder="Rechercher utilisateur..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 220, padding: 12, borderRadius: 10, border: "1px solid #cbd5e1" }}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #cbd5e1" }}>
          <option value="tous">Tous les statuts</option>
          <option value="actif">Actif</option>
          <option value="suspendu">Suspendu</option>
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ padding: 12, borderRadius: 10, border: "1px solid #cbd5e1" }}>
          <option value="name">Trier par nom</option>
          <option value="rides">Trier par trajets</option>
          <option value="rating">Trier par note</option>
        </select>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 840 }}>
          <thead>
            <tr style={{ background: "#f8fafc", color: "#334155", textAlign: "left" }}>
              <th style={thStyle}>Nom</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Trajets</th>
              <th style={thStyle}>Note</th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={tdStyle}>{user.name}</td>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>{user.role}</td>
                <td style={tdStyle}>{user.rides}</td>
                <td style={tdStyle}>{user.rating.toFixed(1)}</td>
                <td style={{ ...tdStyle, color: user.status === "actif" ? "#15803d" : "#b91c1c" }}>{user.status}</td>
                <td style={tdStyle}>
                  <button onClick={() => toggleStatus(user._id)} style={actionButton}>{user.status === "actif" ? "Suspendre" : "Activer"}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const thStyle = { padding: "16px 12px", fontSize: 14, fontWeight: 600 };
const tdStyle = { padding: "16px 12px", fontSize: 14, color: "#0f172a" };
const actionButton = { padding: "8px 12px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" };
