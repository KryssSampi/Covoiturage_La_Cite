"use server";

import { cookies } from "next/headers";
import { adminFetch } from "@/server/admin/admin.api";

export interface Export {
  id: string;
  type: string;
  format?: string;
  status: "Processing" | "Ready" | "Failed" | "Expired";
  createdAt: string;
  expiresAt?: string;
  downloadUrl?: string;
}

export async function getExportsAction(): Promise<Export[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch("/api/admin/exports", {}, token);
}

export async function createExportAction(params: { type: string; format: string }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch("/api/admin/exports", {
    method: "POST",
    body: JSON.stringify(params),
  }, token);
}
