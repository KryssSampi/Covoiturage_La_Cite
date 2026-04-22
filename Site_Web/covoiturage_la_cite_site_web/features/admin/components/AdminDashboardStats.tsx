'use client';

import type { PlatformStatsDto } from '@/server/services/AdminService';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  sub?: string;
}

function StatCard({ label, value, icon, color, sub }: StatCardProps) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

interface AdminDashboardStatsProps {
  stats: PlatformStatsDto;
}

export function AdminDashboardStats({ stats }: AdminDashboardStatsProps) {
  const formatRevenue = (val: number) =>
    new Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' }).format(val);

  const formatCo2 = (val: number) => {
    if (val >= 1000) return `${(val / 1000).toFixed(1)} t`;
    return `${val.toFixed(0)} kg`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatCard
        label="Utilisateurs totaux"
        value={stats.totalUsers.toLocaleString('fr-CA')}
        icon="👥"
        color="text-blue-600"
        sub={`${stats.totalDrivers} conducteurs · ${stats.totalPassengers ?? (stats.totalUsers - stats.totalDrivers)} passagers`}
      />
      <StatCard
        label="Trajets publiés"
        value={stats.totalTrips.toLocaleString('fr-CA')}
        icon="🚗"
        color="text-green-600"
        sub={`${stats.activeTrips} actifs en ce moment`}
      />
      <StatCard
        label="Réservations totales"
        value={stats.totalReservations.toLocaleString('fr-CA')}
        icon="🎫"
        color="text-purple-600"
      />
      <StatCard
        label="Revenus plateforme"
        value={formatRevenue(stats.totalRevenue)}
        icon="💰"
        color="text-yellow-600"
        sub="Commission 15%"
      />
      <StatCard
        label="Note moyenne"
        value={`${stats.averageRating.toFixed(2)} / 5`}
        icon="⭐"
        color="text-orange-500"
        sub="Sur tous les conducteurs"
      />
      <StatCard
        label="CO₂ économisé"
        value={formatCo2(stats.co2Saved)}
        icon="🌿"
        color="text-emerald-600"
        sub="Impact environnemental cumulé"
      />
      <StatCard
        label="Dernière mise à jour"
        value={new Date(stats.calculatedAt).toLocaleTimeString('fr-CA', {
          hour: '2-digit',
          minute: '2-digit',
        })}
        icon="🔄"
        color="text-gray-600"
        sub={new Date(stats.calculatedAt).toLocaleDateString('fr-CA')}
      />
    </div>
  );
}
