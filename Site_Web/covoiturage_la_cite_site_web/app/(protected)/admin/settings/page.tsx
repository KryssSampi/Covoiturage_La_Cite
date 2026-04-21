"use client";

import { useEffect, useState } from "react";
import {
  getSettingsAction,
  updateSettingsAction,
  toggleMaintenanceModeAction,
  PlatformSettings,
} from "@/features/admin/services/admin.settings.actions";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [formData, setFormData] = useState<Partial<PlatformSettings>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getSettingsAction();
      setSettings(data);
      setFormData(data);
    } catch (error) {
      console.error("Erreur chargement settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettingsAction(formData);
      await loadSettings();
      alert("Paramètres sauvegardés avec succès!");
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const handleMaintenanceToggle = async () => {
    try {
      await toggleMaintenanceModeAction(!settings?.maintenanceMode);
      await loadSettings();
    } catch (error) {
      console.error("Erreur mode maintenance:", error);
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (!settings) return <div>Erreur chargement données</div>;

  return (
    <>
      <h1>Configuration Plateforme</h1>

      <section className="settings-section">
        <h2>Mode Maintenance</h2>
        <div className="setting-item">
          <label>
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={handleMaintenanceToggle}
            />
            Mode Maintenance Actif
          </label>
          <p className="info-text">
            Quand activé, seuls les administrateurs peuvent accéder à la plateforme.
          </p>
        </div>
      </section>

      <section className="settings-section">
        <h2>Configuration SMTP</h2>
        <div className="setting-item">
          <label>Serveur SMTP:</label>
          <input
            type="text"
            value={formData.smtpHost || ""}
            onChange={(e) => handleInputChange("smtpHost", e.target.value)}
            placeholder="smtp.gmail.com"
          />
        </div>
        <div className="setting-item">
          <label>Port SMTP:</label>
          <input
            type="number"
            value={formData.smtpPort || ""}
            onChange={(e) => handleInputChange("smtpPort", parseInt(e.target.value))}
            placeholder="587"
          />
        </div>
      </section>

      <section className="settings-section">
        <h2>Sécurité JWT</h2>
        <div className="setting-item">
          <label>Expiration Token (secondes):</label>
          <input
            type="number"
            value={formData.jwtExpiration || ""}
            onChange={(e) => handleInputChange("jwtExpiration", parseInt(e.target.value))}
            placeholder="21600"
          />
          <p className="info-text">Défaut: 21600 (6 heures)</p>
        </div>
      </section>

      <section className="settings-section">
        <h2>Rate Limiting</h2>
        <div className="setting-item">
          <label>Tentatives Connexion Max:</label>
          <input
            type="number"
            value={formData.maxLoginAttempts || ""}
            onChange={(e) => handleInputChange("maxLoginAttempts", parseInt(e.target.value))}
            placeholder="5"
          />
        </div>
        <div className="setting-item">
          <label>Requêtes par Minute:</label>
          <input
            type="number"
            value={formData.rateLimitPerMinute || ""}
            onChange={(e) => handleInputChange("rateLimitPerMinute", parseInt(e.target.value))}
            placeholder="100"
          />
        </div>
      </section>

      <section className="settings-section">
        <h2>CORS - Origines Autorisées</h2>
        <div className="setting-item">
          <label>Origines (une par ligne):</label>
          <textarea
            value={formData.corsOrigins?.join("\n") || ""}
            onChange={(e) =>
              handleInputChange("corsOrigins", e.target.value.split("\n").filter((v) => v))
            }
            rows={5}
            placeholder="https://example.com&#10;https://app.example.com"
          />
        </div>
      </section>

      <div className="settings-actions">
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary"
        >
          {saving ? "Sauvegarde..." : "Sauvegarder Paramètres"}
        </button>
      </div>
    </>
  );
}
