"use server";

import { cookies } from "next/headers";
import { adminFetch } from "@/server/admin/admin.api";

export interface AdminStats {
  activeUsers: number;
  tripsToday: number;
  pendingDrivers: number;
  openReports: number;
  totalCO2SavedKg: number;
}

export async function getDashboardStatsAction(): Promise<AdminStats> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch("/api/admin/stats", {}, token);
}
