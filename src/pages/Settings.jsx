import { useState } from "react";

export default function Settings() {
  const [settings, setSettings] = useState({
    requireInstitutionalEmail: true,
    autoMatching: true,
    notificationsEnabled: true,
    dataRetentionDays: 90,
    maxSeatsPerRide: 4,
    minRatingToClose: 3.5,
  });

  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div>
      <header style={{ marginBottom: 24 }}>
        <p style={{ margin: 0, color: "#64748b" }}>Configuration du systeme</p>
        <h1 style={{ margin: "8px 0 0" }}>Parametres de la plateforme</h1>
      </header>

      <div style={{ display: "grid", gap: 20, maxWidth: 800 }}>
        <div style={cardStyle}>
          <h2>Authentification</h2>
          <p style={paragraphStyle}>Force les inscriptions avec un courriel institutionnel et protege l''acces aux comptes.</p>
          <label style={toggleLabel}>
            <input type="checkbox" checked={settings.requireInstitutionalEmail} onChange={() => toggle("requireInstitutionalEmail")} />
            Exiger un courriel institutionnel
          </label>
        </div>

        <div style={cardStyle}>
          <h2>Matching et notifications</h2>
          <p style={paragraphStyle}>Gere le comportement du systeme de matching et les notifications envoyes aux utilisateurs.</p>
          <label style={toggleLabel}>
            <input type="checkbox" checked={settings.autoMatching} onChange={() => toggle("autoMatching")} />
            Activer le matching automatique
          </label>
          <label style={toggleLabel}>
            <input type="checkbox" checked={settings.notificationsEnabled} onChange={() => toggle("notificationsEnabled")} />
            Activer les notifications push
          </label>
        </div>

        <div style={cardStyle}>
          <h2>Retention des donnees</h2>
          <p style={paragraphStyle}>Determine combien de jours les donnees personnelles sont conservees avant archivage.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12 }}>
            <input type="number" value={settings.dataRetentionDays} readOnly style={{ width: 80, padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" }} />
            <span style={{ color: "#475569" }}>jours</span>
          </div>
        </div>

        <div style={cardStyle}>
          <h2>Limites operationnelles</h2>
          <p style={paragraphStyle}>Etablit les limites acceptables pour les trajets et les utilisateurs.</p>
          <div style={{ display: "grid", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <label style={{ flex: 1 }}>Places maximales par trajet</label>
              <input type="number" value={settings.maxSeatsPerRide} readOnly style={{ width: 80, padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" }} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <label style={{ flex: 1 }}>Note minimale pour cloture</label>
              <input type="number" value={settings.minRatingToClose} readOnly style={{ width: 80, padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const cardStyle = { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 16, padding: 24 };
const paragraphStyle = { margin: "10px 0 0", color: "#475569" };
const toggleLabel = { display: "flex", alignItems: "center", gap: 10, marginTop: 14, color: "#0f172a" };
