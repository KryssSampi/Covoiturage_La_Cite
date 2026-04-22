"use server";

import { cookies } from "next/headers";
import { adminFetch } from "@/server/admin/admin.api";

export interface ComplianceStatus {
  consentCollected: number;
  consentPending: number;
  exportRequests: number;
  anonymizationRequests: number;
  lastAuditDate: string;
  lastReportGenerated: string;
}

export interface UserExport {
  id: string;
  userId: string;
  email: string;
  status: "Pending" | "Processing" | "Ready" | "Expired";
  requestedAt: string;
  expiresAt: string;
  downloadUrl?: string;
}

export async function getComplianceStatusAction(): Promise<ComplianceStatus> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch("/api/admin/compliance/status", {}, token);
}

export async function getExportRequestsAction(): Promise<UserExport[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch("/api/admin/compliance/exports", {}, token);
}

export async function processExportAction(exportId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch(
    `/api/admin/compliance/exports/${exportId}/process`,
    { method: "POST" },
    token
  );
}

export async function anonymizeUserAction(userId: string, reason: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch(
    `/api/admin/compliance/users/${userId}/anonymize`,
    {
      method: "POST",
      body: JSON.stringify({ reason }),
    },
    token
  );
}

export async function getAuditLogsComplianceAction(days: number = 30) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch(
    `/api/admin/compliance/audit-logs?days=${days}`,
    {},
    token
  );
}

export async function generateComplianceReportAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch(
    "/api/admin/compliance/report",
    { method: "POST" },
    token
  );
}

