"use server";

import { cookies } from "next/headers";
import { adminFetch } from "@/server/admin/admin.api";

export interface PlatformAnalytics {
  totalUsers: number;
  activeUsersToday: number;
  activeUsersWeek: number;
  totalTrips: number;
  tripsToday: number;
  totalRevenue: number;
  totalCO2Saved: number;
  averageRating: number;
  pendingApprovals: number;
  reportedIssues: number;
  userGrowthRate: number;
  tripGrowthRate: number;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label: string;
}

export async function getAnalyticsAction(): Promise<PlatformAnalytics> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch("/api/admin/analytics", {}, token);
}

export async function getUserGrowthAction(): Promise<TimeSeriesData[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch("/api/admin/analytics/user-growth", {}, token);
}

export async function getTripTrendAction(): Promise<TimeSeriesData[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch("/api/admin/analytics/trip-trend", {}, token);
}

export async function getRevenueAnalyticsAction(): Promise<TimeSeriesData[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch("/api/admin/analytics/revenue", {}, token);
}

