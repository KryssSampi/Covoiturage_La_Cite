import { adminFetch } from "@/server/admin/admin.api";

export interface AuditLog {
  id: string;
  action: string;
  date: string;
  adminEmail: string;
}

export function getAuditLogs(): Promise<AuditLog[]> {
  return adminFetch("/api/admin/logs");
}