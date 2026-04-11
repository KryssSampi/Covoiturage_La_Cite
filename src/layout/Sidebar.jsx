import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside style={{ width: 220, background: "#1e293b", color: "#fff", minHeight: "100vh" }}>
      <div style={{ padding: 16 }}>
        <h2>Admin</h2>
        <nav style={{ display: "grid", gap: 10 }}>
          <Link style={{ color: "#fff", textDecoration: "none" }} to="/admin/dashboard">Dashboard</Link>
          <Link style={{ color: "#fff", textDecoration: "none" }} to="/admin/users">Users</Link>
          <Link style={{ color: "#fff", textDecoration: "none" }} to="/admin/drivers">Drivers</Link>
          <Link style={{ color: "#fff", textDecoration: "none" }} to="/admin/rides">Rides</Link>
          <Link style={{ color: "#fff", textDecoration: "none" }} to="/admin/reports">Reports</Link>
          <Link style={{ color: "#fff", textDecoration: "none" }} to="/admin/statistics">Statistics</Link>
          <Link style={{ color: "#fff", textDecoration: "none" }} to="/admin/logs">Logs</Link>
          <Link style={{ color: "#fff", textDecoration: "none" }} to="/admin/settings">Settings</Link>
          <Link style={{ color: "#fff", textDecoration: "none" }} to="/admin/exports">Exports</Link>
          <Link style={{ color: "#fff", textDecoration: "none" }} to="/admin/test">Test</Link>
        </nav>
      </div>
      <button
        onClick={handleLogout}
        style={{
          margin: 16,
          padding: 10,
          width: "calc(100% - 32px)",
          background: "#ef4444",
          border: "none",
          color: "#fff",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Déconnexion
      </button>
    </aside>
  );
}