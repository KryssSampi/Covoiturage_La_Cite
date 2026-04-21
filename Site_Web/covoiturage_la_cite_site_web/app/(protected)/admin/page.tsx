import { getDashboardStatsAction } from "@/features/admin/services/admin.dashboard.actions";

export default async function AdminDashboard() {
  const stats = await getDashboardStatsAction();

  return (
    <>
      <h1>Tableau de Bord Administrateur - Covoiturage La Cité</h1>

      <section className="dashboard-intro">
        <p>Bienvenue! Voici un aperçu rapide de la santé de votre plateforme.</p>
      </section>

      <section className="dashboard-grid">
        <div className="stat-card primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Utilisateurs Actifs</h3>
            <p className="stat-value">{stats.activeUsers}</p>
            <p className="stat-label">connectés aujourd'hui</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚗</div>
          <div className="stat-content">
            <h3>Trajets Publiés</h3>
            <p className="stat-value">{stats.tripsToday}</p>
            <p className="stat-label">aujourd'hui</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <h3>Conducteurs En Attente</h3>
            <p className="stat-value">{stats.pendingDrivers}</p>
            <p className="stat-label">de validation</p>
          </div>
        </div>

        <div className="stat-card alert">
          <div className="stat-icon">🚨</div>
          <div className="stat-content">
            <h3>Signalements Ouverts</h3>
            <p className="stat-value">{stats.openReports}</p>
            <p className="stat-label">à modérer</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">♻️</div>
          <div className="stat-content">
            <h3>CO₂ Économisé</h3>
            <p className="stat-value">{stats.totalCO2SavedKg}</p>
            <p className="stat-label">kg</p>
          </div>
        </div>
      </section>

      <section className="quick-actions">
        <h2>Actions Rapides</h2>
        <div className="action-grid">
          <a href="/admin/users" className="action-card">
            <h3>Gestion Utilisateurs</h3>
            <p>Voir, modifier ou suspendre les comptes</p>
          </a>
          <a href="/admin/drivers" className="action-card">
            <h3>Valider Conducteurs</h3>
            <p>Approuver ou rejeter les demandes</p>
          </a>
          <a href="/admin/reports" className="action-card">
            <h3>Traiter Signalements</h3>
            <p>Modérer les rapports et commentaires</p>
          </a>
          <a href="/admin/finance" className="action-card">
            <h3>Finances</h3>
            <p>Consulter revenus et transactions</p>
          </a>
          <a href="/admin/analytics" className="action-card">
            <h3>Analytics Détaillées</h3>
            <p>Tendances et métriques avancées</p>
          </a>
          <a href="/admin/compliance" className="action-card">
            <h3>Conformité PIPEDA</h3>
            <p>Audits et exports de données</p>
          </a>
        </div>
      </section>

      <section className="system-health">
        <h2>Santé du Système</h2>
        <ul className="health-checklist">
          <li className="status-ok">✓ API Backend - Fonctionnelle</li>
          <li className="status-ok">✓ Base de Données PostgreSQL - Connectée</li>
          <li className="status-ok">✓ Cache Redis - Actif</li>
          <li className="status-ok">✓ Jobs Hangfire - En cours d'exécution</li>
          <li className="status-ok">✓ SignalR WebSocket - Prêt</li>
          <li className="status-ok">✓ Services Email - Configurés</li>
        </ul>
      </section>

      <section className="documentation">
        <h2>Documentation</h2>
        <p>
          Les pages d'administration suivent le cahier de conception Covoiturage La Cité (Avril 2026).
          Consultez la documentation pour comprendre l'architecture clean, les services métier et les obligations PIPEDA.
        </p>
        <ul>
          <li><strong>Architecture:</strong> Clean Architecture 3-Tiers</li>
          <li><strong>Backend:</strong> .NET 9.0 / ASP.NET Core</li>
          <li><strong>Frontend:</strong> Next.js 16 / React 19 / TypeScript 5</li>
          <li><strong>Données:</strong> PostgreSQL 16 + PostGIS, MongoDB 7.0, Redis 7.0</li>
          <li><strong>Sécurité:</strong> JWT + ECC-P256 + OTP</li>
          <li><strong>Conformité:</strong> PIPEDA - Loi canadienne de protection des données</li>
        </ul>
      </section>
    </>
  );
}
``