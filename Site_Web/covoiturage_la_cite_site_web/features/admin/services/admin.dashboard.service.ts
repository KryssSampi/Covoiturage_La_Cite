import { adminFetch } from "@/server/admin/admin.api";

export function getDashboardStats() {
  return adminFetch("/api/admin/dashboard");
}