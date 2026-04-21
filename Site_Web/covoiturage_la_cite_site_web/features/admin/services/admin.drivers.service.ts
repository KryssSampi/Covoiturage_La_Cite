import { adminFetch } from "@/server/admin/admin.api";

export interface PendingDriver {
  id: string;
  email: string;
}

export function getPendingDrivers(): Promise<PendingDriver[]> {
  return adminFetch("/api/admin/drivers/pending");
}

export function approveDriver(id: string) {
  return adminFetch(`/api/admin/drivers/${id}/approve`, { method: "PUT" });
}

export function rejectDriver(id: string, reason: string) {
  return adminFetch(`/api/admin/drivers/${id}/reject?reason=${reason}`, {
    method: "PUT",
  });
}