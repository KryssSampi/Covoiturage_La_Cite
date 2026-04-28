import { FiAlertTriangle, FiTruck, FiCheckCircle, FiCloud, FiDatabase, FiRefreshCw, FiUsers } from "react-icons/fi";
import { getDashboardStatsAction } from "@/features/admin/services/admin.actions";

export default async function AdminDashboard() {
  const stats = await getDashboardStatsAction();

  return (
    <>
      <h1>Tableau de Bord Administrateur - Covoiturage La Cite</h1>

      <section className="dashboard-intro">
        <p>Bienvenue! Voici un apercu rapide de la sante de votre plateforme.</p>
      </section>

      <section className="dashboard-grid">
        <div className="stat-card primary">
          <div className="stat-icon"><FiUsers /></div>
          <div className="stat-content">
            <h3>Utilisateurs Actifs</h3>
            <p className="stat-value">{stats.activeUsers}</p>
            <p className="stat-label">connectes aujourd'hui</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><FiTruck /></div>
          <div className="stat-content">
            <h3>Trajets Publies</h3>
            <p className="stat-value">{stats.tripsToday}</p>
            <p className="stat-label">aujourd'hui</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><FiRefreshCw /></div>
          <div className="stat-content">
            <h3>Conducteurs En Attente</h3>
            <p className="stat-value">{stats.pendingDrivers}</p>
            <p className="stat-label">de validation</p>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-icon"><FiAlertTriangle /></div>
          <div className="stat-content">
            <h3>Signalements Ouverts</h3>
            <p className="stat-value">{stats.openReports}</p>
            <p className="stat-label">a moderer</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"><FiCloud /></div>
          <div className="stat-content">
            <h3>CO2 Economise</h3>
            <p className="stat-value">{stats.totalCO2SavedKg}</p>
            <p className="stat-label">kg</p>
          </div>
        </div>
      </section>

      <section className="quick-actions">
        <h2>Actions Rapides</h2>
        <div className="action-grid">
          <a href="/admin/users" className="action-card"><h3>Gestion Utilisateurs</h3><p>Voir, modifier ou suspendre les comptes</p></a>
          <a href="/admin/drivers" className="action-card"><h3>Valider Conducteurs</h3><p>Approuver ou rejeter les demandes</p></a>
          <a href="/admin/reports" className="action-card"><h3>Traiter Signalements</h3><p>Moderer les rapports et commentaires</p></a>
          <a href="/admin/finance" className="action-card"><h3>Finances</h3><p>Consulter revenus et transactions</p></a>
          <a href="/admin/analytics" className="action-card"><h3>Analytics Detaillees</h3><p>Tendances et metriques avancees</p></a>
          <a href="/admin/compliance" className="action-card"><h3>Conformite PIPEDA</h3><p>Audits et exports de donnees</p></a>
        </div>
      </section>

      <section className="system-health">
        <h2>Sante du Systeme</h2>
        <ul className="health-checklist">
          <li className="status-ok"><FiCheckCircle /> API Backend - Fonctionnelle</li>
          <li className="status-ok"><FiDatabase /> Base de Donnees PostgreSQL - Connectee</li>
          <li className="status-ok"><FiCheckCircle /> Cache Redis - Actif</li>
          <li className="status-ok"><FiRefreshCw /> Jobs Hangfire - En cours d'execution</li>
          <li className="status-ok"><FiCheckCircle /> SignalR WebSocket - Pret</li>
          <li className="status-ok"><FiCheckCircle /> Services Email - Configures</li>
        </ul>
      </section>
    </>
  );
}

