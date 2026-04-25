"use server";

import { cookies } from "next/headers";
import { adminFetch } from "@/server/admin/admin.api";

export interface Report {
  id: string;
  userId: string;
  reportedUserId: string;
  category: string;
  description: string;
  status: "Open" | "InReview" | "Resolved" | "Dismissed";
  severity: "Low" | "Medium" | "High" | "Critical";
  createdAt: string;
  resolvedAt?: string;
}

export async function getReportsAction(): Promise<Report[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch("/api/admin/reports", {}, token);
}

export async function updateReportStatusAction(
  reportId: string,
  status: string,
  notes?: string
) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch(
    `/api/admin/reports/${reportId}/status`,
    {
      method: "PUT",
      body: JSON.stringify({ status, notes }),
    },
    token
  );
}

export async function dismissReportAction(reportId: string, reason: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch(
    `/api/admin/reports/${reportId}/dismiss`,
    {
      method: "PUT",
      body: JSON.stringify({ reason }),
    },
    token
  );
}

