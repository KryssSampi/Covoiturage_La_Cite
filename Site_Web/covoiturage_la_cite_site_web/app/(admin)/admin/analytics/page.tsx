"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getPlatformAnalyticsAction,
  getUserGrowthAction,
  getTripTrendAction,
  getRevenueAnalyticsAction,
} from "@/features/admin/services/admin.actions";
import {
  AdminPageHeader,
  AdminTabs,
  StatCard,
  ErrorDisplay,
  LoadingSpinner,
} from "@/features/admin/components/AdminShared";

/* â”€â”€ types locaux â”€â”€ */
interface GrowthPoint { label: string; value: number }
interface TrendPoint  { label: string; trips: number; revenue?: number }

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalDrivers: number;
  activeDrivers: number;
  totalTrips: number;
  completedTrips: number;
  totalRevenue: number;
  avgRating: number;
}

const TABS = ["AperÃ§u", "Croissance utilisateurs", "Tendance trajets", "Revenus"] as const;
type Tab = typeof TABS[number];

/* â”€â”€ mini-chart SVG â”€â”€ */
function SparkLine({ points, color = "#4f46e5" }: { points: number[]; color?: string }) {
  if (!points.length) return null;
  const max = Math.max(...points, 1);
  const w = 300; const h = 60; const pad = 4;
  const step = (w - pad * 2) / Math.max(points.length - 1, 1);
  const coords = points.map((v, i) => [
    pad + i * step,
    h - pad - ((v / max) * (h - pad * 2)),
  ]);
  const d = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={coords.map(([x, y]) => `${x},${y}`).join(" ")}
      />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill={color} />
      ))}
    </svg>
  );
}

function ChartCard({
  title,
  points,
  valueKey,
  color,
  loading,
}: {
  title: string;
  points: unknown[];
  valueKey: string;
  color?: string;
  loading: boolean;
}) {
  const values = points.map((p) => ((p as { [key: string]: unknown })[valueKey] as number) ?? 0);
  const labels = points.map((p) => String((p as { label?: unknown }).label ?? ""));
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-3">
      <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
      {loading ? (
        <div className="h-16 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      ) : points.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-4">Aucune donnÃ©e</p>
      ) : (
        <>
          <SparkLine points={values} color={color} />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            {labels.length > 6
              ? [labels[0], labels[Math.floor(labels.length / 2)], labels[labels.length - 1]].map((l, i) => (
                  <span key={i}>{l}</span>
                ))
              : labels.map((l, i) => <span key={i}>{l}</span>)}
          </div>
          <p className="text-lg font-bold text-slate-800">
            {values.reduce((a, b) => a + b, 0).toLocaleString("fr-CA")}
            <span className="text-xs text-slate-400 ml-1 font-normal">total</span>
          </p>
        </>
      )}
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [tab, setTab] = useState<Tab>("AperÃ§u");
  const [platform, setPlatform] = useState<PlatformStats | null>(null);
  const [growth, setGrowth]     = useState<GrowthPoint[]>([]);
  const [trend, setTrend]       = useState<TrendPoint[]>([]);
  const [revenue, setRevenue]   = useState<GrowthPoint[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [p, g, t, r] = await Promise.all([
        getPlatformAnalyticsAction(),
        getUserGrowthAction(),
        getTripTrendAction(),
        getRevenueAnalyticsAction(),
      ]);
      const pa = p as {
        totalUsers?: number;
        activeUsersToday?: number;
        totalTrips?: number;
        tripsToday?: number;
        totalRevenue?: number;
        averageRating?: number;
      };
      setPlatform({
        totalUsers: pa.totalUsers ?? 0,
        activeUsers: pa.activeUsersToday ?? 0,
        totalDrivers: 0,
        activeDrivers: 0,
        totalTrips: pa.totalTrips ?? 0,
        completedTrips: pa.tripsToday ?? 0,
        totalRevenue: pa.totalRevenue ?? 0,
        avgRating: pa.averageRating ?? 0,
      });
      setGrowth((g as Array<{ label?: string; value?: number }>).map((x) => ({ label: x.label ?? "", value: x.value ?? 0 })));
      setTrend((t as Array<{ label?: string; value?: number }>).map((x) => ({ label: x.label ?? "", trips: x.value ?? 0, revenue: x.value ?? 0 })));
      setRevenue((r as Array<{ label?: string; value?: number }>).map((x) => ({ label: x.label ?? "", value: x.value ?? 0 })));
    } catch (e) {
      setError((e as Error).message ?? "Impossible de charger les analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const kpis = platform
    ? [
        { label: "Utilisateurs totaux", value: platform.totalUsers.toLocaleString("fr-CA"), sub: `${platform.activeUsers} actifs`, color: "blue" as const },
        { label: "Conducteurs",         value: platform.totalDrivers.toLocaleString("fr-CA"), sub: `${platform.activeDrivers} actifs`, color: "indigo" as const },
        { label: "Trajets",             value: platform.totalTrips.toLocaleString("fr-CA"), sub: `${platform.completedTrips} complÃ©tÃ©s`, color: "green" as const },
        { label: "Revenus totaux",      value: `${platform.totalRevenue.toLocaleString("fr-CA")} $`, sub: "cumulatif", color: "emerald" as const },
        { label: "Note moyenne",        value: platform.avgRating.toFixed(2), sub: "/ 5.00", color: "amber" as const },
        { label: "Taux complÃ©tion",     value: platform.totalTrips > 0 ? `${Math.round((platform.completedTrips / platform.totalTrips) * 100)} %` : "â€”", sub: "trajets", color: "teal" as const },
      ]
    : [];

  return (
    <div className="space-y-4">
      <AdminPageHeader
        title="Analytics"
        subtitle="Vue d'ensemble des mÃ©triques plateforme"
        action={
          <button
            onClick={load}
            disabled={loading}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 disabled:opacity-50 transition-colors"
          >
            â†º Actualiser
          </button>
        }
      />

      {error && <ErrorDisplay message={error} onRetry={load} />}

      <AdminTabs tabs={[...TABS]} active={tab} onChange={(t) => setTab(t as Tab)} />

      {tab === "AperÃ§u" && (
        <div className="space-y-4">
          {loading && !platform ? (
            <div className="flex justify-center py-12"><LoadingSpinner /></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {kpis.map((k) => (
                <StatCard key={k.label} label={k.label} value={k.value} sub={k.sub} color={k.color} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "Croissance utilisateurs" && (
        <ChartCard
          title="Nouveaux utilisateurs par pÃ©riode"
          points={growth}
          valueKey="value"
          color="#4f46e5"
          loading={loading}
        />
      )}

      {tab === "Tendance trajets" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard
            title="Nombre de trajets"
            points={trend}
            valueKey="trips"
            color="#059669"
            loading={loading}
          />
          <ChartCard
            title="Revenus par pÃ©riode"
            points={trend}
            valueKey="revenue"
            color="#d97706"
            loading={loading}
          />
        </div>
      )}

      {tab === "Revenus" && (
        <ChartCard
          title="Revenus cumulÃ©s"
          points={revenue}
          valueKey="value"
          color="#10b981"
          loading={loading}
        />
      )}
    </div>
  );
}


