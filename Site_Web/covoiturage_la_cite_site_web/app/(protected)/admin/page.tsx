import { getDashboardStats } from "@/features/admin/services/admin.dashboard.service";
import StatsCard from "@/features/admin/components/StatsCard";

export default async function AdminDashboard() {
  const stats = await getDashboardStats();

  return (
    <>
      <h1>Dashboard Administrateur</h1>
      <div className="stats-grid">
        <StatsCard title="Utilisateurs actifs" value={stats.activeUsers} />
        <StatsCard title="Trajets aujourd’hui" value={stats.tripsToday} />
        <StatsCard title="Conducteurs en attente" value={stats.pendingDrivers} />
        <StatsCard title="Signalements ouverts" value={stats.reportsOpen} />
      </div>
    </>
  );
}
