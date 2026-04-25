"use server";

import { cookies } from "next/headers";
import { adminFetch } from "@/server/admin/admin.api";

export interface AdminUser {
  id: string;
  email: string;
  status: "Active" | "Suspended";
}

export async function getUsersAction(): Promise<AdminUser[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch("/api/admin/users", {}, token);
}

export async function suspendUserAction(userId: string, reason: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("sc_token")?.value;
  return adminFetch(
    `/api/admin/users/${userId}/suspend`,
    {
      method: "PUT",
      body: JSON.stringify({ reason }),
    },
    token
  );
}

