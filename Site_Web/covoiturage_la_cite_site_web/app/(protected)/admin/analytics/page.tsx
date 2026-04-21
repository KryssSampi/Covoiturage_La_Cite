"use client";

import { useEffect, useState } from "react";
import { getAnalyticsAction, PlatformAnalytics, TimeSeriesData, getUserGrowthAction, getTripTrendAction, getRevenueAnalyticsAction } from "@/features/admin/services/admin.analytics.actions";

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState<PlatformAnalytics | null>(null);
  const [userGrowth, setUserGrowth] = useState<TimeSeriesData[]>([]);
  const [tripTrend, setTripTrend] = useState<TimeSeriesData[]>([]);
  const [revenueData, setRevenueData] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [analytics, users, trips, revenue] = await Promise.all([
          getAnalyticsAction(),
          getUserGrowthAction(),
          getTripTrendAction(),
          getRevenueAnalyticsAction(),
        ]);
        setAnalytics(analytics);
        setUserGrowth(users);
        setTripTrend(trips);
        setRevenueData(revenue);
      } catch (error) {
        console.error("Erreur chargement analytics:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (!analytics) return <div>Erreur chargement données</div>;

  return (
    <>
      <h1>Analytics Plateforme</h1>

      <section className="analytics-grid">
        <div className="stat-card">
          <h3>Utilisateurs Totaux</h3>
          <p className="stat-value">{analytics.totalUsers}</p>
          <p className="stat-change">+{analytics.userGrowthRate}% cette semaine</p>
        </div>

        <div className="stat-card">
          <h3>Utilisateurs Actifs (Aujourd'hui)</h3>
          <p className="stat-value">{analytics.activeUsersToday}</p>
          <p className="stat-secondary">{analytics.activeUsersWeek} cette semaine</p>
        </div>

        <div className="stat-card">
          <h3>Trajets Publiés</h3>
          <p className="stat-value">{analytics.totalTrips}</p>
          <p className="stat-change">{analytics.tripsToday} aujourd'hui</p>
        </div>

        <div className="stat-card">
          <h3>Revenu Total</h3>
          <p className="stat-value">${analytics.totalRevenue.toFixed(2)}</p>
          <p className="stat-secondary">15% = platform share</p>
        </div>

        <div className="stat-card">
          <h3>CO₂ Économisé</h3>
          <p className="stat-value">{analytics.totalCO2Saved} kg</p>
          <p className="stat-secondary">Impact environnemental</p>
        </div>

        <div className="stat-card">
          <h3>Note Moyenne</h3>
          <p className="stat-value">{analytics.averageRating.toFixed(1)}/5</p>
          <p className="stat-secondary">Satisfaction utilisateurs</p>
        </div>

        <div className="stat-card alert">
          <h3>Approbations Pendantes</h3>
          <p className="stat-value">{analytics.pendingApprovals}</p>
          <p className="stat-secondary">Conducteurs en attente</p>
        </div>

        <div className="stat-card alert">
          <h3>Signalements Ouverts</h3>
          <p className="stat-value">{analytics.reportedIssues}</p>
          <p className="stat-secondary">À modérer</p>
        </div>
      </section>

      <section className="charts-section">
        <div className="chart-container">
          <h2>Croissance Utilisateurs (7 derniers jours)</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Nouv. Utilisateurs</th>
              </tr>
            </thead>
            <tbody>
              {userGrowth.map((data) => (
                <tr key={data.date}>
                  <td>{data.date}</td>
                  <td>{data.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-container">
          <h2>Tendance Trajets (7 derniers jours)</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Trajets</th>
              </tr>
            </thead>
            <tbody>
              {tripTrend.map((data) => (
                <tr key={data.date}>
                  <td>{data.date}</td>
                  <td>{data.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="chart-container">
          <h2>Revenus (7 derniers jours)</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Revenu</th>
              </tr>
            </thead>
            <tbody>
              {revenueData.map((data) => (
                <tr key={data.date}>
                  <td>{data.date}</td>
                  <td>${data.value.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
