"use server";

import { cookies } from "next/headers";
import { adminFetch } from "@/server/admin/admin.api";

export interface PendingDriver {
  id: string;
  email: string;
}

export async function getPendingDriversAction(): Promise<PendingDriver[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch("/api/admin/drivers/pending", {}, token);
}

export async function approveDriverAction(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch(
    `/api/admin/drivers/${id}/approve`,
    { method: "PUT" },
    token
  );
}

export async function rejectDriverAction(id: string, reason: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;
  return adminFetch(
    `/api/admin/drivers/${id}/reject?reason=${reason}`,
    { method: "PUT" },
    token
  );
}
