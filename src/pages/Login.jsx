import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    const domain = email.split("@")[1] || "";

    if (domain.toLowerCase() !== "lacitec.on.ca") {
      setError("Veuillez utiliser un courriel institutionnel @lacitec.on.ca.");
      return;
    }

    if (!password.trim()) {
      setError("Le mot de passe est requis.");
      return;
    }

    const token = `fake-jwt-token-${Date.now()}`;
    const userRole = email.startsWith("admin") ? "admin" : "user";
    login(token, userRole);
    navigate("/admin/dashboard", { replace: true });
  };

  return (
    <div style={{ maxWidth: 460, margin: "80px auto", padding: 28, border: "1px solid #ddd", borderRadius: 12, boxShadow: "0 12px 30px rgba(15, 23, 42, 0.08)" }}>
      <h1 style={{ marginBottom: 8 }}>Connexion Administrateur</h1>
      <p style={{ margin: "0 0 20px", color: "#475569" }}>Connectez-vous avec votre identifiant institutionnel @lacitec.on.ca.</p>
      {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", marginBottom: 16 }}>
          Courriel institutionnel
          <input
            style={{ width: "100%", padding: 10, marginTop: 8, border: "1px solid #cbd5e1", borderRadius: 8 }}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre.nom@lacitec.on.ca"
          />
        </label>
        <label style={{ display: "block", marginBottom: 20 }}>
          Mot de passe
          <input
            style={{ width: "100%", padding: 10, marginTop: 8, border: "1px solid #cbd5e1", borderRadius: 8 }}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </label>
        <button type="submit" style={{ padding: "12px 16px", width: "100%", background: "#2563eb", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>
          Se connecter
        </button>
      </form>
      <p style={{ marginTop: 18, color: "#475569" }}>
        Pour tester l''acces admin, utilisez une adresse commencant par "admin" et se terminant par "@lacitec.on.ca".
      </p>
    </div>
  );
}
