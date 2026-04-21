import { adminFetch } from "@/server/admin/admin.api";

export interface AdminStats {
  activeUsers: number;
  tripsToday: number;
  pendingDrivers: number;
  openReports: number;
  totalCO2SavedKg: number;
}

export async function getDashboardStats(): Promise<AdminStats> {
  return adminFetch("/api/admin/stats");
}
