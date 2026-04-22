"use server";

import { cookies } from "next/headers";
import { adminFetch } from "@/server/admin/admin.api";

export interface AuditLog {
  id: string;
  action: string;
  date: string;
  adminEmail: string;
}

export async function getAuditLogsAction(): Promise<AuditLog[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch("/api/admin/logs", {}, token);
}

